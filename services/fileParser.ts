
import type { TrialBalanceEntry } from '../types';

export const parseCSV = (csvText: string): TrialBalanceEntry[] => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const header = lines[0].split(',').map(h => h.trim());
  const accountCodeIndex = header.indexOf('account_code');
  const accountNameIndex = header.indexOf('account_name');
  const periodIndex = header.indexOf('period');
  const debitIndex = header.indexOf('debit');
  const creditIndex = header.indexOf('credit');

  if ([accountCodeIndex, accountNameIndex, periodIndex, debitIndex, creditIndex].includes(-1)) {
    throw new Error('CSV header is missing required columns: account_code, account_name, period, debit, credit');
  }

  return lines.slice(1).map(line => {
    // A simple regex to handle commas inside quoted strings
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const cleanedValues = values.map(v => v.replace(/^"|"$/g, '').trim());

    return {
      account_code: cleanedValues[accountCodeIndex] || '',
      account_name: cleanedValues[accountNameIndex] || '',
      period: cleanedValues[periodIndex] || '',
      debit: parseFloat(cleanedValues[debitIndex]) || 0,
      credit: parseFloat(cleanedValues[creditIndex]) || 0,
    };
  });
};
