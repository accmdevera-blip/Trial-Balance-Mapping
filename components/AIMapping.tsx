import React, { useState } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Spinner } from './ui/Spinner';
import { mapAccountsWithAI } from '../services/geminiService';
import type { MappedAccount } from '../types';

const ConfidenceBar: React.FC<{ score: number }> = ({ score }) => {
    let barColor = 'bg-red-500';
    if (score >= 80) {
        barColor = 'bg-green-500';
    } else if (score >= 60) {
        barColor = 'bg-yellow-500';
    }
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className={barColor + " h-2.5 rounded-full"} style={{ width: `${score}%` }}></div>
        </div>
    );
};

export const AIMapping: React.FC = () => {
    const { tbData, mappingTemplate, setMappingTemplate, approvedMappings, setApprovedMappings } = useAppState();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const hasBeenApproved = approvedMappings.length > 0;

    const handleRunMapping = async () => {
        setIsLoading(true);
        setError('');
        setApprovedMappings([]); // Clear previous approvals
        try {
            const result = await mapAccountsWithAI(tbData);
            setMappingTemplate(result);
        } catch (err) {
            console.error(err);
            setError('An error occurred while mapping with AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApproveMappings = () => {
        if (mappingTemplate.length === 0) return;

        const fullMappedData: MappedAccount[] = tbData.map(originalEntry => {
            const mappedInfo = mappingTemplate.find(p => p.account_code === originalEntry.account_code);
            return {
                ...originalEntry,
                account_type: mappedInfo?.account_type || 'Other',
                ifrs_category: mappedInfo?.ifrs_category || 'Unclassified',
                ifrs_subcategory: mappedInfo?.ifrs_subcategory || 'Unclassified',
                confidence_score: mappedInfo?.confidence_score || 0,
                reasoning: mappedInfo?.reasoning || 'AI could not classify this account.'
            };
        });
        
        setApprovedMappings(fullMappedData);
        setMappingTemplate([]); // Clear the template after applying it
    }
    
    const dataToShow = hasBeenApproved ? approvedMappings.filter((v,i,a)=>a.findIndex(t=>(t.account_code === v.account_code))===i) : mappingTemplate;

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <h2 className="text-xl font-bold">AI IFRS Mapping</h2>
                        <div className="flex items-center space-x-2">
                            <Button onClick={handleRunMapping} disabled={isLoading || tbData.length === 0}>
                                {isLoading ? <Spinner/> : 'Run AI Mapping'}
                            </Button>
                            {mappingTemplate.length > 0 && !hasBeenApproved && (
                                <Button onClick={handleApproveMappings}>
                                    Approve All Mappings
                                </Button>
                            )}
                        </div>
                    </div>
                     {hasBeenApproved && (
                        <div className="p-4 bg-green-100 text-green-800 rounded-md">
                            Mappings have been approved and applied to all periods. You can now view Financial Statements and Reports. To re-run the mapping, click "Run AI Mapping" again.
                        </div>
                     )}
                     {tbData.length === 0 && <p className="text-sm text-gray-500 mb-4">Please upload a Trial Balance on the 'Upload TB' tab to begin.</p>}
                     <p className="text-sm text-gray-500">This tool runs on all unique accounts from your Trial Balance to create a single mapping template. Once approved, this template is applied to all reporting periods.</p>
                </div>

                {error && (
                    <div className="p-4 bg-red-100 text-red-800 border-t">{error}</div>
                )}

                {dataToShow.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IFRS Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reasoning</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {dataToShow.map((item, index) => (
                                    <tr key={`${item.account_code}-${index}`} className={item.confidence_score < 60 ? 'bg-red-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.account_name}</div>
                                            <div className="text-sm text-gray-500">{item.account_code}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.ifrs_category}</div>
                                            <div className="text-sm text-gray-500">{item.ifrs_subcategory}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-24 mr-2">
                                                    <ConfidenceBar score={item.confidence_score} />
                                                </div>
                                                <span className="text-sm text-gray-500">{item.confidence_score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-sm whitespace-normal">{item.reasoning}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};