import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useAppState } from '../contexts/AppStateContext';
import { exportMappingToCSV, printFinancialStatements } from '../services/exportService';

export const Reports: React.FC = () => {
    const { approvedMappings, selectedPeriod } = useAppState();

    const handleExportMapping = () => {
        const periodMappings = approvedMappings.filter(m => m.period === selectedPeriod);
        if(selectedPeriod) {
            exportMappingToCSV(periodMappings, selectedPeriod);
        }
    };

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Export Reports for {selectedPeriod}</h2>
                <p className="text-gray-600 mb-6">
                    Generate and download your financial reports and AI mapping results in various formats.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg flex flex-col justify-between">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Financial Statements</h3>
                            <p className="text-sm text-gray-500 mb-4">Export the complete set of IFRS financial statements for the selected period.</p>
                        </div>
                        <Button onClick={printFinancialStatements}>Export as PDF</Button>
                    </div>
                     <div className="p-4 border rounded-lg flex flex-col justify-between">
                        <div>
                           <h3 className="font-semibold text-lg mb-2">AI Mapping Report</h3>
                            <p className="text-sm text-gray-500 mb-4">Download the detailed AI mapping with confidence scores for the selected period.</p>
                        </div>
                        <Button onClick={handleExportMapping}>Export as CSV</Button>
                    </div>
                     <div className="p-4 border rounded-lg flex flex-col justify-between">
                        <div>
                            <h3 className="font-semibold text-lg mb-2">Audit Trail</h3>
                            <p className="text-sm text-gray-500 mb-4">Export a log of all actions and changes made in the app.</p>
                        </div>
                        <Button disabled>Export as PDF</Button>
                    </div>
                </div>
            </div>
        </Card>
    );
};