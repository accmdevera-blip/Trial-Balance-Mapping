
import React from 'react';
import { Card } from './ui/Card';

export const Home: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{ color: '#6b836a' }}>
            Welcome to the IFRS Mapper & Financial Statement Builder
          </h2>
          <p className="text-gray-600 mb-4">
            This application has been developed for Gulaid Holding Group to automate the classification of Trial Balance accounts according to IFRS as endorsed in Saudi Arabia by SOCPA.
          </p>
          <p className="text-gray-600 mb-4">
            It helps auditors and finance professionals to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
            <li>Upload and validate their Trial Balance (Debit = Credit).</li>
            <li>Automatically map accounts to IFRS categories with confidence scores.</li>
            <li>Generate complete Financial Statements and Notes to the Accounts.</li>
            <li>Identify reconciliation variances and improve reporting accuracy.</li>
          </ul>
          <p className="text-gray-600">
            The system supports Saudi Riyal (SAR), uses both Gregorian and Hijri calendars, and ensures compliance with Vision 2030 digital transformation goals.
          </p>
        </div>
        <div className="bg-gray-50 px-6 py-3 border-t">
          <p className="text-xs text-gray-500">
            Prepared by the Finance Department, reviewed by the Group CFO, and approved by the Board of Directors.
          </p>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
              <div className="p-6">
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#6b836a' }}>SOCPA Compliant</h3>
                  <p className="text-sm text-gray-600">Aligns with IFRS taxonomy as endorsed by the Saudi Organization for Chartered and Professional Accountants.</p>
              </div>
          </Card>
           <Card>
              <div className="p-6">
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#6b836a' }}>ZATCA Ready</h3>
                  <p className="text-sm text-gray-600">Generates reports compatible with Zakat, Tax and Customs Authority e-reporting standards.</p>
              </div>
          </Card>
           <Card>
              <div className="p-6">
                  <h3 className="font-bold text-lg mb-2" style={{ color: '#6b836a' }}>Vision 2030 Aligned</h3>
                  <p className="text-sm text-gray-600">Supports digital transformation goals by automating financial reporting and ensuring data integrity.</p>
              </div>
          </Card>
      </div>
    </div>
  );
};
