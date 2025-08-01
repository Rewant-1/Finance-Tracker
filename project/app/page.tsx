"use client";

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpenseForm from '@/components/ExpenseForm';
import Dashboard from '@/components/Dashboard';
import Analytics from '@/components/Analytics';
import TransactionList from '@/components/TransactionList';
import SharedExpenses from '@/components/SharedExpenses';
import { Expense } from '@/types/expense';

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  // Load expenses from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('coupleExpenses');
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
  }, []);

  // Save expenses to localStorage whenever expenses change
  useEffect(() => {
    localStorage.setItem('coupleExpenses', JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const partner1Total = expenses
    .filter(e => e.paidBy === 'partner1')
    .reduce((sum, expense) => sum + expense.amount, 0);
    
  const partner2Total = expenses
    .filter(e => e.paidBy === 'partner2')
    .reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              💕 Our Money Journey
            </h1>
            <p className="text-slate-600">Building our future together, one expense at a time ✨</p>
          </div>
          <Button 
            onClick={() => setShowExpenseForm(true)}
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 w-full sm:w-auto shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense 💸
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">💰 Total Spent</p>
                  <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">👤 Partner 1</p>
                  <p className="text-2xl font-bold">${partner1Total.toFixed(2)}</p>
                  <p className="text-blue-200 text-xs">
                    {totalSpent > 0 ? ((partner1Total / totalSpent) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm">👤 Partner 2</p>
                  <p className="text-2xl font-bold">${partner2Total.toFixed(2)}</p>
                  <p className="text-pink-200 text-xs">
                    {totalSpent > 0 ? ((partner2Total / totalSpent) * 100).toFixed(1) : 0}% of total
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-pink-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              <span className="hidden sm:inline">📊 Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">📈 Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">💳 Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="shared" className="flex items-center gap-2">
              <div className="w-4 h-4 text-center">🤝</div>
              <span className="hidden sm:inline">Shared</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard expenses={expenses} />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics expenses={expenses} />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionList expenses={expenses} onDelete={deleteExpense} />
          </TabsContent>

          <TabsContent value="shared">
            <SharedExpenses expenses={expenses} onDelete={deleteExpense} />
          </TabsContent>
        </Tabs>

        {/* Expense Form Modal */}
        {showExpenseForm && (
          <ExpenseForm
            onClose={() => setShowExpenseForm(false)}
            onSubmit={addExpense}
          />
        )}
      </div>
    </div>
  );
}