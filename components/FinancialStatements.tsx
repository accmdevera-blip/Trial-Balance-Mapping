import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { Card } from './ui/Card';
import type { FinancialStatementsData, FSLineItem } from '../types';
import { generateStatements } from '../services/financialStatementService';

const StatementLine: React.FC<{ item: FSLineItem }> = ({ item }) => {
  const fontWeight = item.isTotal || item.isSubtotal ? 'font-bold' : 'font-normal';
  const paddingLeft = `${(item.indent || 0) * 1.5}rem`;
  const valueFormatted = item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const valueDisplay = item.value < 0 ? `(${Math.abs(item.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : valueFormatted;
  const borderClass = item.isTotal ? 'border-t-2 border-gray-300 pt-2' : (item.isSubtotal ? 'border-t border-gray-200' : 'border-b border-gray-100');

  return (
    <div className={`flex justify-between py-2 ${fontWeight} ${borderClass}`}>
      <span style={{ paddingLeft }}>{item.name}</span>
      <span className="font-mono">{item.value === 0 && !item.isTotal && !item.isSubtotal ? '-' : valueDisplay}</span>
    </div>
  );
};

const StatementTable: React.FC<{ headers: string[], rows: (string | number)[][] }> = ({ headers, rows }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
            <thead>
                <tr className="border-b-2 border-gray-300">
                    {headers.map(h => <th key={h} className={`py-2 px-2 text-left font-bold ${h !== 'Description' ? 'text-right' : ''}`}>{h}</th>)}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => (
                    <tr key={i} className={`border-b border-gray-100 ${i === rows.length - 1 ? 'font-bold border-b-2 border-gray-300' : ''}`}>
                        {row.map((cell, j) => (
                            <td key={j} className={`py-2 px-2 ${j > 0 ? 'text-right font-mono' : ''}`}>
                                {typeof cell === 'number'
                                    ? cell.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                                    : cell}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


export const FinancialStatements: React.FC = () => {
    const { approvedMappings, tbData, selectedPeriod } = useAppState();
    const [statements, setStatements] = useState<FinancialStatementsData | null>(null);

    useEffect(() => {
        if (approvedMappings.length > 0 && selectedPeriod) {
            const generated = generateStatements(approvedMappings, tbData, selectedPeriod);
            setStatements(generated);
        } else {
            setStatements(null);
        }
    }, [approvedMappings, tbData, selectedPeriod]);
    
    if (!selectedPeriod || approvedMappings.filter(m => m.period === selectedPeriod || selectedPeriod === 'Combined').length === 0) {
        return (
            <Card>
                <div className="p-6 text-center text-gray-500">
                    <p>Please approve AI Mappings for period {selectedPeriod} to generate financial statements.</p>
                </div>
            </Card>
        );
    }
    
    const approvalDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const isCombined = selectedPeriod === 'Combined';

    return (
        <div id="financial-statements-content" className="space-y-6">
            <Card classes="print-container">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Gulaid Holding Group</h2>
                        <p className="text-lg">Statement of Financial Position</p>
                        <p className="text-sm text-gray-500">As at 31 December 2025 (for period {selectedPeriod})</p>
                        <p className="text-sm text-gray-500">(Amounts in Saudi Riyal - SAR)</p>
                    </div>
                    <h3 className="text-lg font-bold mt-4 mb-2" style={{ color: '#6b836a' }}>ASSETS</h3>
                    {statements?.statementOfFinancialPosition.assets.map((item, i) => <StatementLine key={`asset-${i}`} item={item}/>)}
                    
                    <h3 className="text-lg font-bold mt-6 mb-2" style={{ color: '#6b836a' }}>EQUITY AND LIABILITIES</h3>
                    {statements?.statementOfFinancialPosition.equityAndLiabilities.map((item, i) => <StatementLine key={`eq-lia-${i}`} item={item}/>)}
                </div>
            </Card>

             <Card classes="print-container">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold">Gulaid Holding Group</h2>
                        <p className="text-lg">Statement of Profit or Loss</p>
                        <p className="text-sm text-gray-500">For the Year Ended 31 December 2025 (for period {selectedPeriod})</p>
                        <p className="text-sm text-gray-500">(Amounts in Saudi Riyal - SAR)</p>
                    </div>
                    {statements?.statementOfProfitOrLoss.map((item, i) => <StatementLine key={`pl-${i}`} item={item}/>)}
                </div>
            </Card>
            
            {!isCombined && statements?.statementOfChangesInEquity.rows.length > 0 && (
                <Card classes="print-container">
                    <div className="p-6">
                         <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold">Gulaid Holding Group</h2>
                            <p className="text-lg">Statement of Changes in Equity</p>
                            <p className="text-sm text-gray-500">For the Year Ended 31 December 2025 (for period {selectedPeriod})</p>
                            <p className="text-sm text-gray-500">(Amounts in Saudi Riyal - SAR)</p>
                        </div>
                        <StatementTable headers={statements.statementOfChangesInEquity.headers} rows={statements.statementOfChangesInEquity.rows} />
                    </div>
                </Card>
            )}
            
            {!isCombined && statements?.statementOfCashFlows.length > 0 && (
                 <Card classes="print-container">
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold">Gulaid Holding Group</h2>
                            <p className="text-lg">Statement of Cash Flows</p>
                            <p className="text-sm text-gray-500">For the Year Ended 31 December 2025 (for period {selectedPeriod})</p>
                            <p className="text-sm text-gray-500">(Amounts in Saudi Riyal - SAR)</p>
                        </div>
                        {statements?.statementOfCashFlows.map((item, i) => <StatementLine key={`cf-${i}`} item={item}/>)}
                    </div>
                </Card>
            )}

            <Card classes="print-container">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#6b836a' }}>Notes to the Financial Statements</h3>
                    <div className="space-y-4 text-sm text-gray-700">
                        <div>
                            <h4 className="font-bold">Note 1: Basis of Preparation</h4>
                            <p>These financial statements have been prepared in accordance with International Financial Reporting Standards (IFRS) as endorsed in the Kingdom of Saudi Arabia by the Saudi Organization for Chartered and Professional Accountants (SOCPA).</p>
                        </div>
                        <div>
                            <h4 className="font-bold">Note 2: Significant Accounting Policies</h4>
                            <p>The principal accounting policies applied in the preparation of these financial statements are set out below. These policies have been consistently applied to all the years presented, unless otherwise stated.</p>
                        </div>
                         <div>
                            <h4 className="font-bold">Note 3: Property, Plant and Equipment (PPE)</h4>
                            <p>PPE is stated at historical cost less accumulated depreciation. The total carrying amount of PPE as of the reporting date is {statements?.statementOfFinancialPosition.assets.find(a => a.name === 'Property, Plant and Equipment')?.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'} SAR.</p>
                        </div>
                    </div>
                </div>
            </Card>
            
            <Card classes="print-container">
                <div className="p-6">
                     <h3 className="text-lg font-bold mb-4" style={{ color: '#6b836a' }}>Approval of Financial Statements</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div><span className="font-semibold">Prepared By:</span> Finance Department</div>
                        <div><span className="font-semibold">Reviewed By:</span> Group CFO</div>
                        <div><span className="font-semibold">Approved By:</span> Board of Directors</div>
                     </div>
                     <p className="text-xs text-gray-500 mt-4">Date of Approval: {approvalDate}</p>
                </div>
            </Card>
        </div>
    );
};