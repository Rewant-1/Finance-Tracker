"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Users, Copy, Check } from 'lucide-react';
import { Expense } from '@/types/expense';

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  users: {
    email: string;
  };
}

interface Group {
  id: string;
  name: string;
  invite_code: string;
}

export default function GroupExpenses() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  
  const [user, setUser] = useState<any>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'food',
    split_with: [] as string[]
  });
  const [copiedCode, setCopiedCode] = useState(false);

  const categories = [
    { value: 'food', label: '🍕 Food & Dining', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
    { value: 'transport', label: '🚗 Transportation', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
    { value: 'entertainment', label: '🎬 Entertainment', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
    { value: 'utilities', label: '⚡ Utilities', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
    { value: 'shopping', label: '🛍️ Shopping', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300' },
    { value: 'health', label: '🏥 Healthcare', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
    { value: 'other', label: '📋 Other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' }
  ];

  useEffect(() => {
    const checkUserAndGroup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/landing');
        return;
      }
      setUser(user);
      
      // Check if user is member of this group
      const { data: memberData } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();
        
      if (!memberData) {
        router.push('/dashboard');
        return;
      }
      
      fetchGroupData();
      fetchMembers();
      fetchExpenses();
    };
    
    checkUserAndGroup();
  }, [groupId, router]);

  const checkUserAndGroup = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/landing');
      return;
    }
    setUser(user);
    
    // Check if user is member of this group
    const { data: memberData } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();
      
    if (!memberData) {
      router.push('/dashboard');
      return;
    }
    
    fetchGroupData();
    fetchMembers();
    fetchExpenses();
  };

  const fetchGroupData = async () => {
    const { data } = await supabase
      .from('groups')
      .select('*')
      .eq('id', groupId)
      .single();
      
    if (data) setGroup(data);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('group_members')
      .select(`
        id,
        user_id,
        role,
        users!inner (email)
      `)
      .eq('group_id', groupId);
      
    if (data) {
      const formattedMembers = data.map(member => ({
        ...member,
        users: Array.isArray(member.users) ? member.users[0] : member.users
      })) as GroupMember[];
      setMembers(formattedMembers);
    }
  };

  const fetchExpenses = async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
      
    if (data) setExpenses(data);
  };

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !user) return;

    const { error } = await supabase
      .from('expenses')
      .insert([{
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        category: newExpense.category,
        user_id: user.id,
        group_id: groupId,
        split_with: newExpense.split_with.length > 0 ? newExpense.split_with : [user.id]
      }]);

    if (!error) {
      fetchExpenses();
      setShowAddExpense(false);
      setNewExpense({ description: '', amount: '', category: 'food', split_with: [] });
    }
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchExpenses();
    }
  };

  const copyInviteLink = () => {
    if (group) {
      navigator.clipboard.writeText(`${window.location.origin}/join/${group.invite_code}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const getCategoryInfo = (category: string) => {
    return categories.find(c => c.value === category) || categories[categories.length - 1];
  };

  const calculateUserBalance = (userId: string) => {
    let balance = 0;
    expenses.forEach(expense => {
      if (expense.user_id === userId) {
        balance += expense.amount;
      }
      if (expense.split_with?.includes(userId)) {
        balance -= expense.amount / expense.split_with.length;
      }
    });
    return balance;
  };

  if (!user || !group) return null;

  return (
    <div className="min-h-screen bg-background dark:bg-background transition-colors duration-500">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6" />
              {group.name}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={copyInviteLink}
            className="flex items-center gap-2"
          >
            {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedCode ? 'Copied!' : 'Invite'}
          </Button>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {members.map((member) => {
            const balance = calculateUserBalance(member.user_id);
            return (
              <Card key={member.id} className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-1">
                    {member.users.email === user.email ? 'You' : member.users.email}
                  </p>
                  <p className={`text-lg font-semibold ${
                    balance > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : balance < 0 
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    ${Math.abs(balance).toFixed(2)} {balance > 0 ? 'owed to you' : balance < 0 ? 'you owe' : 'even'}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add Expense Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Expenses</h2>
          <Button onClick={() => setShowAddExpense(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Expense
          </Button>
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
          {expenses.map((expense) => {
            const categoryInfo = getCategoryInfo(expense.category);
            const paidByUser = members.find(m => m.user_id === expense.user_id);
            const splitCount = expense.split_with?.length || 1;
            
            return (
              <Card key={expense.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                        <span className="text-lg font-semibold text-slate-900 dark:text-white">
                          ${expense.amount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-200 mb-1">{expense.description}</p>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p>Paid by: {paidByUser?.users.email === user.email ? 'You' : paidByUser?.users.email}</p>
                        <p>Split between {splitCount} member{splitCount !== 1 ? 's' : ''} • ${(expense.amount / splitCount).toFixed(2)} each</p>
                        <p>{new Date(expense.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {expenses.length === 0 && (
            <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed border-2 border-slate-300 dark:border-slate-600">
              <CardContent className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 mb-4">No expenses yet</p>
                <Button onClick={() => setShowAddExpense(true)}>Add your first expense</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New Expense</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Description (e.g., 'Dinner at Pizza Place')"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                />
                <Select value={newExpense.category} onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Split with:</p>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <label key={member.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newExpense.split_with.includes(member.user_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewExpense(prev => ({ 
                                ...prev, 
                                split_with: [...prev.split_with, member.user_id] 
                              }));
                            } else {
                              setNewExpense(prev => ({ 
                                ...prev, 
                                split_with: prev.split_with.filter(id => id !== member.user_id) 
                              }));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {member.users.email === user.email ? 'You' : member.users.email}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={addExpense} className="flex-1">
                    Add Expense
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddExpense(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
