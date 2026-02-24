export interface BrokerConfig {
    id: string;
    name: string;
    feeType: 'PERCENTAGE' | 'FIXED';
    makerFee: number;
    takerFee: number;
}
