import React from 'react';
import type { Tab } from '../types';
import { TABS, THEME_COLORS } from '../constants';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  disabledTabs: Tab[];
  availablePeriods: string[];
  selectedPeriod: string | null;
  setSelectedPeriod: (period: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    activeTab, 
    setActiveTab, 
    disabledTabs, 
    availablePeriods,
    selectedPeriod,
    setSelectedPeriod
}) => {
  return (
    <header style={{ backgroundColor: THEME_COLORS.primary }} className="text-white shadow-md no-print">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">IFRS Mapper & Financial Statement Builder</h1>
            <p className="text-sm opacity-90">For Gulaid Holding Group</p>
          </div>
           {availablePeriods.length > 0 && (
            <div className="flex items-center space-x-2">
              <label htmlFor="period-select" className="block text-sm font-medium text-white whitespace-nowrap">
                Reporting Period
              </label>
              <select
                id="period-select"
                value={selectedPeriod || ''}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="block w-full max-w-xs pl-3 pr-10 py-2 text-base bg-white/20 border-transparent focus:outline-none focus:ring-2 focus:ring-white/50 rounded-md shadow-sm text-white"
              >
                {availablePeriods.map(period => (
                  <option key={period} value={period} className="text-black">{period}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="flex border-b-2 border-white/20">
          {TABS.map((tab) => {
            const isDisabled = disabledTabs.includes(tab);
            return (
              <button
                key={tab}
                onClick={() => !isDisabled && setActiveTab(tab)}
                disabled={isDisabled}
                className={`py-3 px-4 sm:px-6 text-sm font-semibold transition-colors duration-200 ease-in-out focus:outline-none ${
                  activeTab === tab
                    ? 'border-b-4'
                    : isDisabled ? 'opacity-40 cursor-not-allowed' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  borderColor: activeTab === tab ? THEME_COLORS.secondary : 'transparent',
                }}
              >
                {tab.toUpperCase()}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  );
};