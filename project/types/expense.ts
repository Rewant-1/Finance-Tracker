export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paidBy: 'partner1' | 'partner2';
  date: string;
  isShared?: boolean;
}

export type ExpenseCategory = 
  | 'Food & Dining'
  | 'Transportation'
  | 'Shopping'
  | 'Entertainment'
  | 'Bills & Utilities'
  | 'Healthcare'
  | 'Travel'
  | 'Groceries'
  | 'Other';