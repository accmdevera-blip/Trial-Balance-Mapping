
export type Tab = 'Home' | 'Upload TB' | 'AI Mapping' | 'Financial Statements' | 'Reports';

export interface TrialBalanceEntry {
  account_code: string;
  account_name: string;
  period: string;
  debit: number;
  credit: number;
}

export interface BaseMappedAccount {
  account_code: string;
  account_name: string;
  account_type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' | 'Other';
  ifrs_category: string;
  ifrs_subcategory: string;
  confidence_score: number;
  reasoning: string;
}

export interface MappedAccount extends BaseMappedAccount {
  debit: number;
  credit: number;
  period: string;
}

export interface FSLineItem {
  name: string;
  value: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
  indent?: number;
}

export interface FinancialStatementsData {
  statementOfFinancialPosition: {
    assets: FSLineItem[];
    equityAndLiabilities: FSLineItem[];
  };
  statementOfProfitOrLoss: FSLineItem[];
  statementOfCashFlows: FSLineItem[];
  statementOfChangesInEquity: {
      headers: string[];
      rows: (string | number)[][];
  };
}