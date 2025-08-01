"use client";

import { useState, useMemo } from 'react';
import { Trash2, Filter, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Expense } from '@/types/expense';

interface TransactionListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export default function TransactionList({ expenses, onDelete }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPerson, setFilterPerson] = useState('all');

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      const matchesPerson = filterPerson === 'all' || expense.paidBy === filterPerson;
      
      return matchesSearch && matchesCategory && matchesPerson;
    });
  }, [expenses, searchTerm, filterCategory, filterPerson]);

  const categories = Array.from(new Set(expenses.map(e => e.category)));

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            🔍 Find Your Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPerson} onValueChange={setFilterPerson}>
              <SelectTrigger>
                <SelectValue placeholder="All People" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All People</SelectItem>
                <SelectItem value="partner1">Partner 1</SelectItem>
                <SelectItem value="partner2">Partner 2</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar className="w-4 h-4" />
              <span>{filteredExpenses.length} transactions</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No expenses match your search</h3>
              <p className="text-slate-500">Try adjusting your filters or search terms 🔍</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense.id} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">
                        {expense.description || expense.category}
                      </h4>
                      {expense.isShared && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">💕 Shared</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                      <span>•</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          expense.paidBy === 'partner1' 
                            ? 'border-blue-200 text-blue-700 bg-blue-50' 
                            : 'border-pink-200 text-pink-700 bg-pink-50'
                        }`}
                      >
                        {expense.paidBy === 'partner1' ? 'Partner 1' : 'Partner 2'}
                      </Badge>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xl font-bold">
                        ${expense.amount.toFixed(2)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(expense.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}