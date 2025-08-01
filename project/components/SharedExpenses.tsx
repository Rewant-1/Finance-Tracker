"use client";

import { useMemo, useState } from 'react';
import { Heart, Users, Calculator, Trash2, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Expense } from '@/types/expense';

interface SharedExpensesProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

export default function SharedExpenses({ expenses, onDelete }: SharedExpensesProps) {
  const [splitMethod, setSplitMethod] = useState<'equal' | 'percentage'>('equal');

  const sharedExpenses = useMemo(() => {
    return expenses.filter(expense => expense.isShared);
  }, [expenses]);

  const analytics = useMemo(() => {
    const totalShared = sharedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const byPerson = sharedExpenses.reduce((acc, expense) => {
      acc[expense.paidBy] = (acc[expense.paidBy] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const partner1Paid = byPerson.partner1 || 0;
    const partner2Paid = byPerson.partner2 || 0;

    // Calculate what each person should pay (50/50 split)
    const shouldPayEach = totalShared / 2;
    
    // Calculate who owes whom
    const partner1Balance = partner1Paid - shouldPayEach;
    const partner2Balance = partner2Paid - shouldPayEach;

    return {
      totalShared,
      partner1Paid,
      partner2Paid,
      shouldPayEach,
      partner1Balance,
      partner2Balance,
    };
  }, [sharedExpenses]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shared expense? 💔')) {
      onDelete(id);
    }
  };

  if (sharedExpenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🤝</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No shared expenses yet</h3>
        <p className="text-slate-500">Start adding shared expenses to see how to split them fairly! 💕</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">💕 Total Shared</p>
                <p className="text-2xl font-bold">${analytics.totalShared.toFixed(2)}</p>
              </div>
              <Heart className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">👤 Partner 1 Paid</p>
                <p className="text-2xl font-bold">${analytics.partner1Paid.toFixed(2)}</p>
                <p className="text-blue-200 text-xs">
                  Should pay: ${analytics.shouldPayEach.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm">👤 Partner 2 Paid</p>
                <p className="text-2xl font-bold">${analytics.partner2Paid.toFixed(2)}</p>
                <p className="text-pink-200 text-xs">
                  Should pay: ${analytics.shouldPayEach.toFixed(2)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-pink-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settlement Card */}
      <Card className="border-2 border-gradient-to-r from-purple-200 to-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            💰 Settlement Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Split Method</span>
              </div>
              <Select value={splitMethod} onValueChange={(value: 'equal' | 'percentage') => setSplitMethod(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equal">50/50 Split</SelectItem>
                  <SelectItem value="percentage">By Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              {analytics.partner1Balance > 0 ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    💚 Partner 2 owes Partner 1: <span className="text-xl font-bold">${Math.abs(analytics.partner1Balance).toFixed(2)}</span>
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Partner 1 paid ${analytics.partner1Balance.toFixed(2)} more than their fair share
                  </p>
                </div>
              ) : analytics.partner2Balance > 0 ? (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    💙 Partner 1 owes Partner 2: <span className="text-xl font-bold">${Math.abs(analytics.partner2Balance).toFixed(2)}</span>
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Partner 2 paid ${analytics.partner2Balance.toFixed(2)} more than their fair share
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-purple-800 font-medium text-center">
                    🎉 You're all settled up! Perfect balance! 💕
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shared Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            🤝 Shared Expenses ({sharedExpenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sharedExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">
                      {expense.description || expense.category}
                    </h4>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                      💕 Shared
                    </Badge>
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
                      Paid by {expense.paidBy === 'partner1' ? 'Partner 1' : 'Partner 2'}
                    </Badge>
                    <span>•</span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Each person's share: ${(expense.amount / 2).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-700">
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}