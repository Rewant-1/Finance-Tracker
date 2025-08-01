export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  user_id: string;
  group_id: string;
  split_with?: string[];
  created_at: string;
  paidBy?: 'partner1' | 'partner2'; // Keep for backward compatibility
  date?: string; // Keep for backward compatibility
  isShared?: boolean; // Keep for backward compatibility
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