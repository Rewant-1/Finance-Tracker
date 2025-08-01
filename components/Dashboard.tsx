"use client";

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Expense } from '@/types/expense';

interface DashboardProps {
  expenses: Expense[];
}

const COLORS = {
  partner1: '#3B82F6', // Blue
  partner2: '#EC4899', // Pink  
  shared: '#8B5CF6'    // Purple
};

const CATEGORY_COLORS = [
  '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#6B7280'
];

export default function Dashboard({ expenses }: DashboardProps) {
  const analytics = useMemo(() => {
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const byPerson = expenses.reduce((acc, expense) => {
      acc[expense.paidBy] = (acc[expense.paidBy] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const personData = [
      { name: 'Partner 1', value: byPerson.partner1 || 0, color: COLORS.partner1 },
      { name: 'Partner 2', value: byPerson.partner2 || 0, color: COLORS.partner2 }
    ];

    const categoryData = Object.entries(byCategory)
      .map(([category, amount], index) => ({
        name: category,
        amount,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
      }))
      .sort((a, b) => b.amount - a.amount);

    const recentExpenses = expenses.slice(0, 5);

    return { totalSpent, personData, categoryData, recentExpenses };
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">💕</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to start your money journey?</h3>
        <p className="text-slate-500">Add your first expense to see beautiful analytics! ✨</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Spending by Person */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💕 Our Spending Split
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.personData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value, percent }) => 
                    `${name}: $${value.toFixed(2)} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {analytics.personData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Where Our Money Goes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryData} margin={{ left: 20, right: 20 }}>
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  fontSize={12}
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {analytics.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⏰ Recent Adventures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{expense.description || expense.category}</span>
                    {expense.isShared && (
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">💕 Shared</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>{expense.category}</span>
                    <span>•</span>
                    <span>{new Date(expense.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        expense.paidBy === 'partner1' 
                          ? 'border-blue-200 text-blue-700' 
                          : 'border-pink-200 text-pink-700'
                      }`}
                    >
                      {expense.paidBy === 'partner1' ? 'Partner 1' : 'Partner 2'}
                    </Badge>
                  </div>
                </div>
                <div className="text-lg font-semibold">
                  ${expense.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}