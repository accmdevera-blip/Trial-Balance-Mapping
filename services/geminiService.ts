import { GoogleGenAI, Type } from "@google/genai";
import type { TrialBalanceEntry, BaseMappedAccount } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const mapAccountsWithAI = async (tbData: TrialBalanceEntry[]): Promise<BaseMappedAccount[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    // Create a unique list of accounts based on account_code to avoid redundant processing
    const uniqueAccounts = Array.from(new Map(tbData.map(item => [item.account_code, item])).values());
    const tbForPrompt = uniqueAccounts.map(acc => `${acc.account_code},"${acc.account_name}"`).join('\n');

    const prompt = `
        You are an expert IFRS accountant specializing in SOCPA standards for Saudi Arabia.
        Your task is to analyze a Trial Balance and map each account to its appropriate IFRS category and subcategory.
        Determine the account type (Asset, Liability, Equity, Revenue, Expense) for each account.
        For each mapping, provide a confidence score from 0-100 and a brief, professional reasoning.

        Trial Balance Accounts to map (in CSV format of account_code, account_name):
        --- TB DATA START ---
        ${tbForPrompt}
        --- TB DATA END ---

        Return the result as a JSON array matching the provided schema.
    `;
    
    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                account_code: { type: Type.STRING },
                account_name: { type: Type.STRING },
                account_type: { 
                    type: Type.STRING,
                    enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Other']
                },
                ifrs_category: { type: Type.STRING },
                ifrs_subcategory: { type: Type.STRING },
                confidence_score: { type: Type.NUMBER },
                reasoning: { type: Type.STRING },
            },
            required: ["account_code", "account_name", "account_type", "ifrs_category", "ifrs_subcategory", "confidence_score", "reasoning"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2
            },
        });

        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as BaseMappedAccount[];
        
        // Return the raw mapping template. Merging will happen upon approval in the UI.
        return parsedResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a valid response from the AI mapping service.");
    }
};