// Pure domain model interface — NO framework imports
export interface IRiskSettings {
    id: string;
    userId: string;
    maxPositionSizePercent: number;
    dailyLossLimit: number;
    dailyLossUsed: number;
    lastResetDate: Date | null;
}
