import React, { useState, useRef } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { parseCSV } from '../services/fileParser';

const CheckCircleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationTriangleIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);


export const UploadTB: React.FC = () => {
  const { setTbData, isBalanced, balanceDifference, selectedPeriod } = useAppState();
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.type !== 'text/csv') {
          setError('Invalid file type. Please upload a CSV file.');
          return;
      }
      setFileName(file.name);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = parseCSV(text);
          setTbData(data);
        } catch (err) {
            setError('Failed to parse CSV file. Please check the format.');
            setTbData([]);
        }
      };
      reader.readAsText(file);
    }
  };
  
  const handleButtonClick = () => {
      fileInputRef.current?.click();
  };
  
  const formatCurrency = (value: number) => {
    return `SAR ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Upload Trial Balance</h2>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
            />
            <Button onClick={handleButtonClick}>
              Choose File
            </Button>
            {fileName && <span className="text-gray-600">{fileName}</span>}
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
      </Card>
      
      {isBalanced !== null && (
        <Card>
            <div className={`p-6 flex items-center space-x-4 rounded-t-lg ${isBalanced ? 'bg-green-100' : 'bg-red-100'}`}>
                {isBalanced ? <CheckCircleIcon/> : <ExclamationTriangleIcon />}
                <div>
                    <h3 className={`text-lg font-bold ${isBalanced ? 'text-green-800' : 'text-red-800'}`}>
                        {isBalanced ? `Trial Balance for ${selectedPeriod} is Balanced` : `Variance Detected for ${selectedPeriod}`}
                    </h3>
                    <p className={`text-sm ${isBalanced ? 'text-green-700' : 'text-red-700'}`}>
                        {isBalanced ? 'Total Debits equal Total Credits.' : `Difference: ${formatCurrency(balanceDifference)}`}
                    </p>
                </div>
            </div>
        </Card>
      )}

    </div>
  );
};