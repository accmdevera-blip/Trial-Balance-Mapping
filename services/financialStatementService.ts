import type { MappedAccount, FinancialStatementsData, FSLineItem, TrialBalanceEntry } from '../types';

const sumAccounts = (accounts: MappedAccount[]): number => {
    return accounts.reduce((total, acc) => {
        if (['Asset', 'Expense'].includes(acc.account_type)) {
            return total + acc.debit - acc.credit;
        }
        return total + acc.credit - acc.debit;
    }, 0);
};

const filterByCategory = (accounts: MappedAccount[], category: string) => {
    return accounts.filter(acc => acc.ifrs_category === category);
};

const getPreviousPeriod = (allPeriods: string[], currentPeriod: string): string | null => {
    const sortedPeriods = allPeriods.filter(p => p !== 'Combined').sort((a,b) => a.localeCompare(b)); // sort ascending
    const currentIndex = sortedPeriods.indexOf(currentPeriod);
    return currentIndex > 0 ? sortedPeriods[currentIndex - 1] : null;
};

const getCategoryBalance = (accounts: MappedAccount[], category: string, period: string): number => {
    const periodAccounts = accounts.filter(acc => acc.period === period);
    const categoryAccounts = filterByCategory(periodAccounts, category);
    return sumAccounts(categoryAccounts);
};

const generateProfitAndLoss = (periodMappings: MappedAccount[]): { statement: FSLineItem[], netProfit: number } => {
    const revenueAccounts = filterByCategory(periodMappings, 'Revenue from Contracts with Customers');
    const totalRevenue = sumAccounts(revenueAccounts);

    const cogsAccounts = filterByCategory(periodMappings, 'Cost of Sales');
    const totalCogs = sumAccounts(cogsAccounts);

    const grossProfit = totalRevenue - totalCogs;

    const operatingExpenseAccounts = periodMappings.filter(acc => 
        ['Administrative Expenses', 'Selling and Distribution Expenses', 'Depreciation and Amortization', 'Impairment Losses'].includes(acc.ifrs_category));
    const totalOperatingExpenses = sumAccounts(operatingExpenseAccounts);
    
    const operatingProfit = grossProfit - totalOperatingExpenses;
    
    const financeCostAccounts = filterByCategory(periodMappings, 'Finance Costs');
    const totalFinanceCosts = sumAccounts(financeCostAccounts);
    
    const netProfit = operatingProfit - totalFinanceCosts;

    const statement: FSLineItem[] = [
        { name: 'Revenue', value: totalRevenue },
        { name: 'Cost of Sales', value: -totalCogs },
        { name: 'Gross Profit', value: grossProfit, isSubtotal: true },
        { name: 'Operating Expenses', value: -totalOperatingExpenses },
        { name: 'Operating Profit', value: operatingProfit, isSubtotal: true },
        { name: 'Finance Costs', value: -totalFinanceCosts },
        { name: 'Profit Before Zakat and Tax', value: netProfit, isSubtotal: true },
        { name: 'Zakat and Tax Expense', value: 0 },
        { name: 'Net Profit for the Year', value: netProfit, isTotal: true },
    ];
    return { statement, netProfit };
};

const generateBalanceSheet = (periodMappings: MappedAccount[], netProfit: number): { assets: FSLineItem[], equityAndLiabilities: FSLineItem[] } => {
    // ASSETS
    const ppeAccounts = filterByCategory(periodMappings, 'Property Plant and Equipment');
    const intangibleAccounts = filterByCategory(periodMappings, 'Intangible Assets');
    const nonCurrentAssetsValue = sumAccounts(ppeAccounts) + sumAccounts(intangibleAccounts);
    
    const inventoryAccounts = filterByCategory(periodMappings, 'Inventories');
    const receivableAccounts = filterByCategory(periodMappings, 'Trade and Other Receivables');
    const cashAccounts = filterByCategory(periodMappings, 'Cash and Cash Equivalents');
    const currentAssetsValue = sumAccounts(inventoryAccounts) + sumAccounts(receivableAccounts) + sumAccounts(cashAccounts);
    
    const totalAssets = nonCurrentAssetsValue + currentAssetsValue;

    const assets: FSLineItem[] = [
        { name: 'Non-current Assets', value: 0, isSubtotal: true },
        { name: 'Property, Plant and Equipment', value: sumAccounts(ppeAccounts), indent: 1 },
        { name: 'Intangible Assets', value: sumAccounts(intangibleAccounts), indent: 1 },
        { name: 'Total Non-current Assets', value: nonCurrentAssetsValue, isSubtotal: true },
        { name: 'Current Assets', value: 0, isSubtotal: true },
        { name: 'Inventories', value: sumAccounts(inventoryAccounts), indent: 1 },
        { name: 'Trade and Other Receivables', value: sumAccounts(receivableAccounts), indent: 1 },
        { name: 'Cash and Cash Equivalents', value: sumAccounts(cashAccounts), indent: 1 },
        { name: 'Total Current Assets', value: currentAssetsValue, isSubtotal: true },
        { name: 'Total Assets', value: totalAssets, isTotal: true },
    ];

    // EQUITY & LIABILITIES
    const shareCapitalAccounts = filterByCategory(periodMappings, 'Share Capital');
    const retainedEarningsAccounts = filterByCategory(periodMappings, 'Retained Earnings');
    const totalRetainedEarnings = sumAccounts(retainedEarningsAccounts) + netProfit;
    const totalEquity = sumAccounts(shareCapitalAccounts) + totalRetainedEarnings;

    const nonCurrentLiabilitiesAccounts = filterByCategory(periodMappings, 'Borrowings').filter(a => a.account_name.toLowerCase().includes('long-term'));
    const totalNonCurrentLiabilities = sumAccounts(nonCurrentLiabilitiesAccounts);
    
    const currentLiabilitiesAccounts = periodMappings.filter(acc => 
        acc.ifrs_category === 'Trade and Other Payables' || (acc.ifrs_category === 'Borrowings' && !acc.account_name.toLowerCase().includes('long-term'))
    );
    const totalCurrentLiabilities = sumAccounts(currentLiabilitiesAccounts);

    const totalLiabilities = totalNonCurrentLiabilities + totalCurrentLiabilities;
    const totalEquityAndLiabilities = totalEquity + totalLiabilities;
    
    const equityAndLiabilities: FSLineItem[] = [
        { name: 'Equity', value: 0, isSubtotal: true },
        { name: 'Share Capital', value: sumAccounts(shareCapitalAccounts), indent: 1 },
        { name: 'Retained Earnings', value: totalRetainedEarnings, indent: 1 },
        { name: 'Total Equity', value: totalEquity, isSubtotal: true },
        { name: 'Liabilities', value: 0, isSubtotal: true },
        { name: 'Non-current Liabilities', value: totalNonCurrentLiabilities, indent: 1 },
        { name: 'Current Liabilities', value: totalCurrentLiabilities, indent: 1 },
        { name: 'Total Liabilities', value: totalLiabilities, isSubtotal: true },
        { name: 'Total Equity and Liabilities', value: totalEquityAndLiabilities, isTotal: true },
    ];
    
    return { assets, equityAndLiabilities };
};

export const generateStatements = (
    allMappedData: MappedAccount[],
    allTbData: TrialBalanceEntry[],
    selectedPeriod: string
): FinancialStatementsData => {

    if (selectedPeriod === 'Combined') {
        const plAccounts = allMappedData.filter(acc => ['Revenue', 'Expense', 'Other'].includes(acc.account_type));
        const { statement: statementOfProfitOrLoss, netProfit } = generateProfitAndLoss(plAccounts);

        const allPeriods = [...new Set(allMappedData.map(d => d.period))].filter(p => p !== 'Combined');
        const latestPeriod = allPeriods.sort().pop() || '';
        const latestPeriodMappings = allMappedData.filter(d => d.period === latestPeriod);
        
        // In a combined view, BS net profit is only from the latest period for correct RE calculation.
        const { netProfit: latestPeriodNetProfit } = generateProfitAndLoss(latestPeriodMappings);
        const { assets, equityAndLiabilities } = generateBalanceSheet(latestPeriodMappings, latestPeriodNetProfit);

        return {
            statementOfFinancialPosition: { assets, equityAndLiabilities },
            statementOfProfitOrLoss,
            statementOfCashFlows: [],
            statementOfChangesInEquity: { headers: [], rows: [] },
        };
    }
    
    const periodMappings = allMappedData.filter(d => d.period === selectedPeriod);
    const { statement: statementOfProfitOrLoss, netProfit } = generateProfitAndLoss(periodMappings);
    const { assets, equityAndLiabilities } = generateBalanceSheet(periodMappings, netProfit);

    let statementOfCashFlows: FSLineItem[] = [];
    let statementOfChangesInEquity = { headers: [] as string[], rows: [] as (string | number)[][] };

    const allPeriods = [...new Set(allMappedData.map(d => d.period))];
    const previousPeriod = getPreviousPeriod(allPeriods, selectedPeriod);

    if (previousPeriod) {
        // --- Statement of Cash Flows (Indirect) ---
        const depreciation = sumAccounts(filterByCategory(periodMappings, 'Depreciation and Amortization'));
        const changeInReceivables = getCategoryBalance(allMappedData, 'Trade and Other Receivables', previousPeriod) - getCategoryBalance(allMappedData, 'Trade and Other Receivables', selectedPeriod);
        const changeInInventories = getCategoryBalance(allMappedData, 'Inventories', previousPeriod) - getCategoryBalance(allMappedData, 'Inventories', selectedPeriod);
        const changeInPayables = getCategoryBalance(allMappedData, 'Trade and Other Payables', selectedPeriod) - getCategoryBalance(allMappedData, 'Trade and Other Payables', previousPeriod);
        const cashFromOps = netProfit + depreciation + changeInReceivables + changeInInventories + changeInPayables;

        const ppeStart = getCategoryBalance(allMappedData, 'Property Plant and Equipment', previousPeriod);
        const ppeEnd = getCategoryBalance(allMappedData, 'Property Plant and Equipment', selectedPeriod);
        const cashFromInvesting = ppeStart - ppeEnd - depreciation;

        const debtStart = getCategoryBalance(allMappedData, 'Borrowings', previousPeriod);
        const debtEnd = getCategoryBalance(allMappedData, 'Borrowings', selectedPeriod);
        const dividendsDeclared = sumAccounts(periodMappings.filter(a => a.account_name.toLowerCase().includes('dividend')));
        const cashFromFinancing = (debtEnd - debtStart) - dividendsDeclared;
        
        const netChangeInCash = cashFromOps + cashFromInvesting + cashFromFinancing;
        const cashStart = getCategoryBalance(allMappedData, 'Cash and Cash Equivalents', previousPeriod);
        const cashEnd = getCategoryBalance(allMappedData, 'Cash and Cash Equivalents', selectedPeriod);

        statementOfCashFlows = [
            { name: 'Cash flows from operating activities', value: 0, isSubtotal: true },
            { name: 'Net Profit', value: netProfit, indent: 1 },
            { name: 'Adjustments for non-cash items:', value: 0, indent: 1 },
            { name: 'Depreciation and amortization', value: depreciation, indent: 2 },
            { name: 'Changes in working capital:', value: 0, indent: 1 },
            { name: 'Decrease/(Increase) in receivables', value: changeInReceivables, indent: 2 },
            { name: 'Decrease/(Increase) in inventories', value: changeInInventories, indent: 2 },
            { name: 'Increase/(Decrease) in payables', value: changeInPayables, indent: 2 },
            { name: 'Net cash from operating activities', value: cashFromOps, isSubtotal: true },
            { name: 'Cash flows from investing activities', value: 0, isSubtotal: true },
            { name: 'Purchase of Property, Plant and Equipment', value: cashFromInvesting, indent: 1 },
            { name: 'Net cash used in investing activities', value: cashFromInvesting, isSubtotal: true },
            { name: 'Cash flows from financing activities', value: 0, isSubtotal: true },
            { name: 'Proceeds from borrowings', value: debtEnd - debtStart, indent: 1 },
            { name: 'Dividends paid', value: -dividendsDeclared, indent: 1 },
            { name: 'Net cash from financing activities', value: cashFromFinancing, isSubtotal: true },
            { name: 'Net increase/(decrease) in cash', value: netChangeInCash, isSubtotal: true },
            { name: 'Cash at beginning of period', value: cashStart },
            { name: 'Cash at end of period', value: cashEnd, isTotal: true },
        ];
        
        // --- Statement of Changes in Equity ---
        const soceHeaders = ['Description', 'Share Capital', 'Retained Earnings', 'Total Equity'];
        const soceRows: (string | number)[][] = [];
        const scStart = getCategoryBalance(allMappedData, 'Share Capital', previousPeriod);
        const reStart = getCategoryBalance(allMappedData, 'Retained Earnings', previousPeriod);
        soceRows.push(['Opening Balance', scStart, reStart, scStart + reStart]);
        soceRows.push(['Net Profit for the Year', 0, netProfit, netProfit]);
        const scEnd = getCategoryBalance(allMappedData, 'Share Capital', selectedPeriod);
        const issueOfShares = scEnd - scStart;
        if (Math.abs(issueOfShares) > 0.01) soceRows.push(['Issue of Share Capital', issueOfShares, 0, issueOfShares]);
        if (dividendsDeclared > 0) soceRows.push(['Dividends', 0, -dividendsDeclared, -dividendsDeclared]);
        const reEnd = reStart + netProfit - dividendsDeclared;
        soceRows.push(['Closing Balance', scEnd, reEnd, scEnd + reEnd]);
        statementOfChangesInEquity = { headers: soceHeaders, rows: soceRows };
    }

    return {
        statementOfFinancialPosition: { assets, equityAndLiabilities },
        statementOfProfitOrLoss,
        statementOfCashFlows,
        statementOfChangesInEquity,
    };
};