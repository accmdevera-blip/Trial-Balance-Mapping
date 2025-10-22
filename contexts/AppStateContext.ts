import React from 'react';
import type { TrialBalanceEntry, MappedAccount, BaseMappedAccount } from '../types';

export interface AppState {
  tbData: TrialBalanceEntry[];
  setTbData: React.Dispatch<React.SetStateAction<TrialBalanceEntry[]>>;
  availablePeriods: string[];
  setAvailablePeriods: React.Dispatch<React.SetStateAction<string[]>>;
  selectedPeriod: string | null;
  setSelectedPeriod: React.Dispatch<React.SetStateAction<string | null>>;
  isBalanced: boolean | null;
  setIsBalanced: React.Dispatch<React.SetStateAction<boolean | null>>;
  balanceDifference: number;
  setBalanceDifference: React.Dispatch<React.SetStateAction<number>>;
  mappingTemplate: BaseMappedAccount[];
  setMappingTemplate: React.Dispatch<React.SetStateAction<BaseMappedAccount[]>>;
  approvedMappings: MappedAccount[];
  setApprovedMappings: React.Dispatch<React.SetStateAction<MappedAccount[]>>;
  periodData: TrialBalanceEntry[];
}

export const AppStateContext = React.createContext<AppState | null>(null);

export const useAppState = (): AppState => {
  const context = React.useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateContext.Provider');
  }
  return context;
};