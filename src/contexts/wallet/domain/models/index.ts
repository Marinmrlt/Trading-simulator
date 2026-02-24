// Pure domain model interfaces — NO framework imports

export interface IWallet {
    id: string;
    userId: string;
    currency: string;
    balance: number;
    locked: number;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'BUY' | 'SELL';

export interface ITransaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    currency: string;
    price: number | null;
    timestamp: Date;
}

export interface IEquitySnapshot {
    id: string;
    userId: string;
    totalValueUSD: number;
    timestamp: Date;
}
