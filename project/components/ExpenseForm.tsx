"use client";

import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Expense, ExpenseCategory } from '@/types/expense';

interface ExpenseFormProps {
  onClose: () => void;
  onSubmit: (expense: Omit<Expense, 'id'>) => void;
}

const categories: ExpenseCategory[] = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Groceries',
  'Other'
];

export default function ExpenseForm({ onClose, onSubmit }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    paidBy: '',
    isShared: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category || !formData.paidBy) {
      return;
    }

    onSubmit({
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category as ExpenseCategory,
      paidBy: formData.paidBy as 'partner1' | 'partner2',
      date: new Date().toISOString(),
      isShared: formData.isShared,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            💸 Add New Expense
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                required
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What was this expense for?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Paid By</Label>
              <Select
                value={formData.paidBy}
                onValueChange={(value) => setFormData(prev => ({ ...prev, paidBy: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Who paid?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner1">Partner 1</SelectItem>
                  <SelectItem value="partner2">Partner 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="shared"
                checked={formData.isShared}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isShared: checked as boolean }))
                }
              />
              <Label htmlFor="shared" className="text-sm">
                💕 This is a shared expense (we'll split it!)
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Add Expense ✨
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}