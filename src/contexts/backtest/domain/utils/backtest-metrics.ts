/**
 * Advanced Backtest Metrics Calculator
 * 
 * Calculates performance metrics from backtest results:
 * - Sharpe Ratio, Sortino Ratio
 * - Max Drawdown (value + %)
 * - Win Rate, Profit Factor
 * - Average Win / Average Loss
 * - Best / Worst Trade
 * - Longest Winning / Losing Streak
 */

export interface BacktestTrade {
    type: 'BUY' | 'SELL';
    price: number;
    amount?: number;
    fee: number;
    timestamp: number;
    equity: number;
}

export interface EquityPoint {
    time: number;
    value: number;
}

export interface DrawdownInfo {
    maxDrawdown: number;       // Absolute value
    maxDrawdownPct: number;    // Percentage
    peakEquity: number;        // Peak before max drawdown
    troughEquity: number;      // Trough of max drawdown
    drawdownCurve: { time: number; drawdownPct: number }[];
}

export interface BacktestMetrics {
    // Return metrics
    totalReturnPct: number;
    annualizedReturnPct: number;

    // Risk metrics
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: DrawdownInfo;
    volatility: number;

    // Trade metrics
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    profitFactor: number;
    averageWin: number;
    averageLoss: number;
    bestTrade: number;
    worstTrade: number;
    longestWinStreak: number;
    longestLoseStreak: number;

    // Averages
    averageTradePnl: number;
    expectancy: number;   // (winRate * avgWin) - (lossRate * avgLoss)
}

/**
 * Calculate all advanced metrics from equity curve and trade list.
 */
export function calculateMetrics(
    initialCapital: number,
    finalEquity: number,
    trades: BacktestTrade[],
    equityCurve: EquityPoint[],
    riskFreeRate: number = 0.02,  // 2% annual risk-free rate
): BacktestMetrics {
    const totalReturnPct = ((finalEquity - initialCapital) / initialCapital) * 100;

    // --- Drawdown ---
    const drawdownInfo = calculateDrawdown(equityCurve);

    // --- Daily/Period Returns for Sharpe ---
    const periodReturns = calculatePeriodReturns(equityCurve);
    const volatility = standardDeviation(periodReturns) * Math.sqrt(252); // Annualized (252 trading days)

    // Annualized return (rough: based on candle count as "days")
    const periods = equityCurve.length;
    const annualizedReturnPct = periods > 0
        ? (Math.pow(finalEquity / initialCapital, 252 / periods) - 1) * 100
        : 0;

    // Sharpe Ratio
    const avgPeriodReturn = periodReturns.length > 0
        ? periodReturns.reduce((a, b) => a + b, 0) / periodReturns.length
        : 0;
    const periodStdDev = standardDeviation(periodReturns);
    const riskFreePerPeriod = riskFreeRate / 252;
    const sharpeRatio = periodStdDev !== 0
        ? ((avgPeriodReturn - riskFreePerPeriod) / periodStdDev) * Math.sqrt(252)
        : 0;

    // Sortino Ratio (only downside deviation)
    const downsideReturns = periodReturns.filter(r => r < riskFreePerPeriod);
    const downsideDev = standardDeviation(downsideReturns) * Math.sqrt(252);
    const sortinoRatio = downsideDev !== 0
        ? (annualizedReturnPct / 100 - riskFreeRate) / downsideDev
        : 0;

    // --- Trade Analysis ---
    const roundTrips = extractRoundTrips(trades);
    const pnls = roundTrips.map(rt => rt.pnl);

    const winningPnls = pnls.filter(p => p > 0);
    const losingPnls = pnls.filter(p => p <= 0);

    const totalTrades = roundTrips.length;
    const winningTrades = winningPnls.length;
    const losingTrades = losingPnls.length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const grossProfit = winningPnls.reduce((a, b) => a + b, 0);
    const grossLoss = Math.abs(losingPnls.reduce((a, b) => a + b, 0));
    const profitFactor = grossLoss !== 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

    const averageWin = winningPnls.length > 0 ? grossProfit / winningPnls.length : 0;
    const averageLoss = losingPnls.length > 0 ? grossLoss / losingPnls.length : 0;
    const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0;
    const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0;

    const averageTradePnl = totalTrades > 0 ? pnls.reduce((a, b) => a + b, 0) / totalTrades : 0;

    // Expectancy: (WinRate * AvgWin) - (LossRate * AvgLoss)
    const lossRate = totalTrades > 0 ? losingTrades / totalTrades : 0;
    const expectancy = (winRate / 100 * averageWin) - (lossRate * averageLoss);

    // Streaks
    const { longestWinStreak, longestLoseStreak } = calculateStreaks(pnls);

    return {
        totalReturnPct: round(totalReturnPct),
        annualizedReturnPct: round(annualizedReturnPct),
        sharpeRatio: round(sharpeRatio),
        sortinoRatio: round(sortinoRatio),
        maxDrawdown: drawdownInfo,
        volatility: round(volatility * 100), // as percentage
        totalTrades,
        winningTrades,
        losingTrades,
        winRate: round(winRate),
        profitFactor: round(profitFactor),
        averageWin: round(averageWin),
        averageLoss: round(averageLoss),
        bestTrade: round(bestTrade),
        worstTrade: round(worstTrade),
        longestWinStreak,
        longestLoseStreak,
        averageTradePnl: round(averageTradePnl),
        expectancy: round(expectancy),
    };
}

// --- Helper Functions ---

function calculateDrawdown(equityCurve: EquityPoint[]): DrawdownInfo {
    let peak = 0;
    let maxDD = 0;
    let maxDDPct = 0;
    let peakEquity = 0;
    let troughEquity = 0;

    const drawdownCurve: { time: number; drawdownPct: number }[] = [];

    for (const point of equityCurve) {
        if (point.value > peak) {
            peak = point.value;
        }
        const dd = peak - point.value;
        const ddPct = peak > 0 ? (dd / peak) * 100 : 0;

        drawdownCurve.push({ time: point.time, drawdownPct: round(ddPct) });

        if (dd > maxDD) {
            maxDD = dd;
            maxDDPct = ddPct;
            peakEquity = peak;
            troughEquity = point.value;
        }
    }

    return {
        maxDrawdown: round(maxDD),
        maxDrawdownPct: round(maxDDPct),
        peakEquity: round(peakEquity),
        troughEquity: round(troughEquity),
        drawdownCurve,
    };
}

function calculatePeriodReturns(equityCurve: EquityPoint[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < equityCurve.length; i++) {
        const prev = equityCurve[i - 1].value;
        if (prev !== 0) {
            returns.push((equityCurve[i].value - prev) / prev);
        }
    }
    return returns;
}

interface RoundTrip {
    buyPrice: number;
    sellPrice: number;
    amount: number;
    buyFee: number;
    sellFee: number;
    pnl: number;
}

function extractRoundTrips(trades: BacktestTrade[]): RoundTrip[] {
    const roundTrips: RoundTrip[] = [];
    let lastBuy: BacktestTrade | null = null;

    for (const trade of trades) {
        if (trade.type === 'BUY') {
            lastBuy = trade;
        } else if (trade.type === 'SELL' && lastBuy) {
            const amount = lastBuy.amount || 0;
            const buyCost = lastBuy.price * amount + lastBuy.fee;
            const sellRevenue = trade.price * amount - trade.fee;
            const pnl = sellRevenue - buyCost;

            roundTrips.push({
                buyPrice: lastBuy.price,
                sellPrice: trade.price,
                amount,
                buyFee: lastBuy.fee,
                sellFee: trade.fee,
                pnl,
            });
            lastBuy = null;
        }
    }

    return roundTrips;
}

function calculateStreaks(pnls: number[]): { longestWinStreak: number; longestLoseStreak: number } {
    let winStreak = 0, loseStreak = 0;
    let maxWin = 0, maxLose = 0;

    for (const pnl of pnls) {
        if (pnl > 0) {
            winStreak++;
            loseStreak = 0;
            maxWin = Math.max(maxWin, winStreak);
        } else {
            loseStreak++;
            winStreak = 0;
            maxLose = Math.max(maxLose, loseStreak);
        }
    }

    return { longestWinStreak: maxWin, longestLoseStreak: maxLose };
}

function standardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function round(value: number, decimals: number = 2): number {
    return Number(value.toFixed(decimals));
}
