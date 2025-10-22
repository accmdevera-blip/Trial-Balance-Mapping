import type { MappedAccount } from '../types';

const escapeCsvCell = (cellData: string | number) => {
    const stringData = String(cellData);
    if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
        return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
};

export const exportMappingToCSV = (data: MappedAccount[], period: string) => {
    const headers = [
        'account_code', 'account_name', 'period', 'debit', 'credit', 
        'account_type', 'ifrs_category', 'ifrs_subcategory', 
        'confidence_score', 'reasoning'
    ];

    const csvRows = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => escapeCsvCell(row[header as keyof MappedAccount])).join(',')
        )
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `IFRS_Mapping_${period}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const printFinancialStatements = () => {
    window.print();
};
