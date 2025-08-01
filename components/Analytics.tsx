"use client";

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Expense } from '@/types/expense';

interface AnalyticsProps {
  expenses: Expense[];
}

export default function Analytics({ expenses }: AnalyticsProps) {
  const analytics = useMemo(() => {
    // Monthly spending trend
    const monthlyData = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!acc[month]) {
        acc[month] = { month, partner1: 0, partner2: 0, total: 0 };
      }
      
      acc[month][expense.paidBy] += expense.amount;
      acc[month].total += expense.amount;
      
      return acc;
    }, {} as Record<string, any>);

    const sortedMonthlyData = Object.values(monthlyData).sort((a: any, b: any) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );

    // Category insights
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const categoryInsights = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSpent > 0 ? (amount / totalSpent) * 100 : 0,
        partner1: expenses
          .filter(e => e.category === category && e.paidBy === 'partner1')
          .reduce((sum, e) => sum + e.amount, 0),
        partner2: expenses
          .filter(e => e.category === category && e.paidBy === 'partner2')
          .reduce((sum, e) => sum + e.amount, 0),
      }))
      .sort((a, b) => b.amount - a.amount);

    // Weekly spending
    const weeklyData = expenses.reduce((acc, expense) => {
      const week = new Date(expense.date);
      const weekStart = new Date(week.setDate(week.getDate() - week.getDay()));
      const weekKey = weekStart.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!acc[weekKey]) {
        acc[weekKey] = { week: weekKey, amount: 0 };
      }
      
      acc[weekKey].amount += expense.amount;
      
      return acc;
    }, {} as Record<string, any>);

    const sortedWeeklyData = Object.values(weeklyData)
      .sort((a: any, b: any) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(-8); // Last 8 weeks

    return {
      monthlyData: sortedMonthlyData,
      categoryInsights,
      weeklyData: sortedWeeklyData,
      totalSpent,
    };
  }, [expenses]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Your analytics are waiting! ✨</h3>
        <p className="text-slate-500">Add some expenses to see beautiful insights about your spending patterns 💕</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Our Monthly Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`, 
                    name === 'partner1' ? 'Partner 1' : 
                    name === 'partner2' ? 'Partner 2' : 'Total'
                  ]} 
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="partner1" 
                  stackId="2" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.8}
                />
                <Area 
                  type="monotone" 
                  dataKey="partner2" 
                  stackId="3" 
                  stroke="#EC4899" 
                  fill="#EC4899" 
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Spending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📅 Weekly Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Deep Dive */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Deep Dive Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryInsights.map((insight) => (
              <div key={insight.category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{insight.category}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{insight.percentage.toFixed(1)}%</Badge>
                    <span className="font-semibold">${insight.amount.toFixed(2)}</span>
                  </div>
                </div>
                <Progress value={insight.percentage} className="h-2" />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Partner 1: ${insight.partner1.toFixed(2)}</span>
                  <span>Partner 2: ${insight.partner2.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}