import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Home } from './components/Home';
import { UploadTB } from './components/UploadTB';
import { AIMapping } from './components/AIMapping';
import { FinancialStatements } from './components/FinancialStatements';
import { Reports } from './components/Reports';
import type { Tab, TrialBalanceEntry, MappedAccount, BaseMappedAccount } from './types';
import { AppState, AppStateContext } from './contexts/AppStateContext';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Home');
  const [tbData, setTbData] = useState<TrialBalanceEntry[]>([]);
  const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [isBalanced, setIsBalanced] = useState<boolean | null>(null);
  const [balanceDifference, setBalanceDifference] = useState<number>(0);
  const [mappingTemplate, setMappingTemplate] = useState<BaseMappedAccount[]>([]);
  const [approvedMappings, setApprovedMappings] = useState<MappedAccount[]>([]);
  
  const periodData = useMemo((): TrialBalanceEntry[] => {
    if (!selectedPeriod || tbData.length === 0) return [];
    
    if (selectedPeriod === 'Combined') {
      const aggregated = new Map<string, TrialBalanceEntry>();
      tbData.forEach(entry => {
        const key = entry.account_code;
        if (aggregated.has(key)) {
          const existing = aggregated.get(key)!;
          existing.debit += entry.debit;
          existing.credit += entry.credit;
        } else {
          aggregated.set(key, { ...entry, debit: entry.debit, credit: entry.credit, period: 'Combined' });
        }
      });
      return Array.from(aggregated.values());
    }
    
    return tbData.filter(d => d.period === selectedPeriod);
  }, [tbData, selectedPeriod]);

  useEffect(() => {
    if (periodData.length > 0) {
      const totalDebit = periodData.reduce((sum, row) => sum + row.debit, 0);
      const totalCredit = periodData.reduce((sum, row) => sum + row.credit, 0);
      const difference = totalDebit - totalCredit;
      setBalanceDifference(difference);
      setIsBalanced(Math.abs(difference) < 0.01);
    } else {
      setIsBalanced(null);
      setBalanceDifference(0);
    }
  }, [periodData]);

  const appState: AppState = {
    tbData,
    setTbData,
    availablePeriods,
    setAvailablePeriods,
    selectedPeriod,
    setSelectedPeriod,
    isBalanced,
    setIsBalanced,
    balanceDifference,
    setBalanceDifference,
    mappingTemplate,
    setMappingTemplate,
    approvedMappings,
    setApprovedMappings,
    periodData,
  };

  useEffect(() => {
    const uniquePeriods = Array.from(new Set(tbData.map(item => item.period))).sort((a: string, b: string) => b.localeCompare(a));
    if (uniquePeriods.length > 1) {
      setAvailablePeriods(['Combined', ...uniquePeriods]);
    } else {
      setAvailablePeriods(uniquePeriods);
    }
     // Reset dependant state when new data is loaded
    setApprovedMappings([]);
    setMappingTemplate([]);
    setSelectedPeriod(null);
  }, [tbData]);

  useEffect(() => {
    if (availablePeriods.length > 0 && !selectedPeriod) {
      setSelectedPeriod(availablePeriods[0]);
    }
  }, [availablePeriods, selectedPeriod]);

  const mappingsApproved = approvedMappings.length > 0;

  const disabledTabs = useMemo(() => {
    const disabled: Tab[] = [];
    if (tbData.length === 0) {
       disabled.push('AI Mapping');
    }
    if (!mappingsApproved) {
      disabled.push('Financial Statements', 'Reports');
    }
    return disabled;
  }, [tbData, mappingsApproved]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <Home />;
      case 'Upload TB':
        return <UploadTB />;
      case 'AI Mapping':
        return <AIMapping />;
      case 'Financial Statements':
        return <FinancialStatements />;
      case 'Reports':
        return <Reports />;
      default:
        return <Home />;
    }
  };

  return (
    <AppStateContext.Provider value={appState}>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <Header 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            disabledTabs={disabledTabs}
            availablePeriods={availablePeriods}
            selectedPeriod={selectedPeriod}
            setSelectedPeriod={setSelectedPeriod}
        />
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {renderContent()}
        </main>
      </div>
    </AppStateContext.Provider>
  );
};

export default App;