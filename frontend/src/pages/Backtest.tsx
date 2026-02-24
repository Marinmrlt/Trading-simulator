import { useState } from 'react';
import axiosInstance from '../api/axios';
import { Play, TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { createChart, ColorType, LineSeries, CandlestickSeries, HistogramSeries, CrosshairMode } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import { useRef, useEffect } from 'react';

export default function Backtest() {
    const [symbol, setSymbol] = useState('BTC-USD');
    const [provider, setProvider] = useState('yahoo');
    const [timeframe, setTimeframe] = useState('1d');
    const [strategy, setStrategy] = useState('SMA_CROSS');
    const [capital, setCapital] = useState(10000);
    const [limit, setLimit] = useState(365);

    // Strategy specific params
    const [smaShort, setSmaShort] = useState(10);
    const [smaLong, setSmaLong] = useState(50);
    const [rsiPeriod, setRsiPeriod] = useState(14);
    const [rsiOverbought, setRsiOverbought] = useState(70);
    const [rsiOversold, setRsiOversold] = useState(30);

    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const rsiContainerRef = useRef<HTMLDivElement>(null);
    const macdContainerRef = useRef<HTMLDivElement>(null);

    const chartRef = useRef<IChartApi | null>(null);
    const rsiChartRef = useRef<IChartApi | null>(null);
    const macdChartRef = useRef<IChartApi | null>(null);

    const runBacktest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);

        let parameters: any = {};
        if (strategy === 'SMA_CROSS') {
            parameters = { shortPeriod: smaShort, longPeriod: smaLong };
        } else if (strategy === 'RSI') {
            parameters = { period: rsiPeriod, overboughtThreshold: rsiOverbought, oversoldThreshold: rsiOversold };
        } else if (strategy === 'MACD') {
            parameters = { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 };
        }

        try {
            const res = await axiosInstance.post('/backtest/run', {
                symbol,
                provider,
                timeframe,
                initialCapital: capital,
                strategy,
                limit,
                parameters
            });
            setResult(res.data.data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Erreur lors du backtest');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (result && chartContainerRef.current) {
            const commonOptions = {
                layout: { background: { type: ColorType.Solid, color: '#1e293b' }, textColor: '#94a3b8' },
                grid: { vertLines: { color: '#334155' }, horzLines: { color: '#334155' } },
                crosshair: { mode: CrosshairMode.Normal },
            };

            // --- 1. Main Price Chart (Candlesticks + SMA + Markers) ---
            const chart = createChart(chartContainerRef.current, {
                ...commonOptions,
                width: chartContainerRef.current.clientWidth,
                height: 400,
            });
            chartRef.current = chart;

            const candleSeries = chart.addSeries(CandlestickSeries, {
                upColor: '#26a69a', downColor: '#ef5350', borderVisible: false, wickUpColor: '#26a69a', wickDownColor: '#ef5350'
            });

            if (result.chartCandles?.length > 0) {
                candleSeries.setData(result.chartCandles);
            }

            // SMA Overlays
            if (result.indicators?.smaShort?.length > 0) {
                const smaShortSeries = chart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 2, title: 'SMA Court' });
                smaShortSeries.setData(result.indicators.smaShort);
            }
            if (result.indicators?.smaLong?.length > 0) {
                const smaLongSeries = chart.addSeries(LineSeries, { color: '#FF6D00', lineWidth: 2, title: 'SMA Long' });
                smaLongSeries.setData(result.indicators.smaLong);
            }

            // Trade Markers
            if (result.trades?.length > 0) {
                const markers = result.trades.map((t: any) => ({
                    time: Math.floor(new Date(t.timestamp).getTime() / 1000),
                    position: t.type === 'BUY' ? 'belowBar' : 'aboveBar',
                    color: t.type === 'BUY' ? '#26a69a' : '#ef5350',
                    shape: t.type === 'BUY' ? 'arrowUp' : 'arrowDown',
                    text: t.type
                })).sort((a: any, b: any) => a.time - b.time);

                // deduplicate markers on same timestamp (lightweight charts throws error if duplicate time in markers)
                const uniqueMarkers: any[] = [];
                const seenTimes = new Set();
                for (const m of markers) {
                    if (!seenTimes.has(m.time)) {
                        uniqueMarkers.push(m);
                        seenTimes.add(m.time);
                    }
                }

                (candleSeries as any).setMarkers(uniqueMarkers);
            }

            // --- 2. RSI Chart ---
            if (result.indicators?.rsi?.length > 0 && rsiContainerRef.current) {
                const rsiChart = createChart(rsiContainerRef.current, {
                    ...commonOptions,
                    width: rsiContainerRef.current.clientWidth,
                    height: 150,
                });
                rsiChartRef.current = rsiChart;

                const rsiSeries = rsiChart.addSeries(LineSeries, { color: '#9c27b0', lineWidth: 2, title: 'RSI' });
                rsiSeries.setData(result.indicators.rsi);

                // Add Overbought/Oversold lines 
                rsiSeries.createPriceLine({ price: 70, color: '#ef5350', lineWidth: 1, lineStyle: 2 });
                rsiSeries.createPriceLine({ price: 30, color: '#26a69a', lineWidth: 1, lineStyle: 2 });

                // Sync TimeScale
                chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
                    if (range) rsiChart.timeScale().setVisibleRange(range);
                });
            }

            // --- 3. MACD Chart ---
            if (result.indicators?.macdLine?.length > 0 && macdContainerRef.current) {
                const macdChart = createChart(macdContainerRef.current, {
                    ...commonOptions,
                    width: macdContainerRef.current.clientWidth,
                    height: 150,
                });
                macdChartRef.current = macdChart;

                const macdLine = macdChart.addSeries(LineSeries, { color: '#2962FF', lineWidth: 2, title: 'MACD' });
                macdLine.setData(result.indicators.macdLine);

                const signalLine = macdChart.addSeries(LineSeries, { color: '#FF6D00', lineWidth: 2, title: 'Signal' });
                signalLine.setData(result.indicators.macdSignal);

                const histogram = macdChart.addSeries(HistogramSeries, { title: 'Hist' });
                histogram.setData(result.indicators.macdHistogram);

                chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
                    if (range) macdChart.timeScale().setVisibleRange(range);
                });
            }

            chart.timeScale().fitContent();

            const handleResize = () => {
                if (chartContainerRef.current && chartRef.current) {
                    chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
                }
                if (rsiContainerRef.current && rsiChartRef.current) {
                    rsiChartRef.current.applyOptions({ width: rsiContainerRef.current.clientWidth });
                }
                if (macdContainerRef.current && macdChartRef.current) {
                    macdChartRef.current.applyOptions({ width: macdContainerRef.current.clientWidth });
                }
            };
            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);

                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                }
                if (rsiChartRef.current) {
                    rsiChartRef.current.remove();
                    rsiChartRef.current = null;
                }
                if (macdChartRef.current) {
                    macdChartRef.current.remove();
                    macdChartRef.current = null;
                }
            };
        }
    }, [result]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={28} color="var(--primary)" />
                    Laboratoire de Backtesting
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Testez vos stratégies de trading automatisé sur des données historiques (Actions, Cryptos).</p>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Configuration Panel */}
                <div style={{ flex: '1 1 350px', backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Configuration du Test</h2>

                    {error && (
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={runBacktest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 2 }}>
                                <label>Actif (Symbole)</label>
                                <input type="text" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} placeholder="Ex: AAPL, BTC-USD, MSFT" required />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Source (Provider)</label>
                                <select value={provider} onChange={e => setProvider(e.target.value)}>
                                    <option value="yahoo">Yahoo Finance</option>
                                    <option value="binance">Binance</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Intervalle</label>
                                <select value={timeframe} onChange={e => setTimeframe(e.target.value)}>
                                    <option value="1h">1 Heure</option>
                                    <option value="1d">1 Jour</option>
                                    <option value="1w">1 Semaine</option>
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label>Historique (Bougies)</label>
                                <input type="number" value={limit} onChange={e => setLimit(Number(e.target.value))} min="10" max="2000" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Capital de départ ($)</label>
                            <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} min="100" />
                        </div>

                        <div className="form-group">
                            <label>Stratégie</label>
                            <select value={strategy} onChange={e => setStrategy(e.target.value)}>
                                <option value="MULTI_CONFIRM">Stratégie Multicritères (SMA + RSI + MACD)</option>
                                <option value="SMA_CROSS">Croisement Moyennes Mobiles (SMA)</option>
                                <option value="RSI">Relative Strength Index (RSI)</option>
                                <option value="MACD">MACD Standard</option>
                            </select>
                        </div>

                        {/* Dynamic Parameters */}
                        <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Paramètres de la stratégie</h3>

                            {strategy === 'SMA_CROSS' && (
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>SMA Courte</label>
                                        <input type="number" value={smaShort} onChange={e => setSmaShort(Number(e.target.value))} min="2" max="200" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>SMA Longue</label>
                                        <input type="number" value={smaLong} onChange={e => setSmaLong(Number(e.target.value))} min="2" max="200" />
                                    </div>
                                </div>
                            )}

                            {strategy === 'RSI' && (
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <div className="form-group" style={{ flex: '1 1 100%' }}>
                                        <label>Période RSI</label>
                                        <input type="number" value={rsiPeriod} onChange={e => setRsiPeriod(Number(e.target.value))} min="2" max="100" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Surachat (&gt;)</label>
                                        <input type="number" value={rsiOverbought} onChange={e => setRsiOverbought(Number(e.target.value))} min="50" max="100" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Survente (&lt;)</label>
                                        <input type="number" value={rsiOversold} onChange={e => setRsiOversold(Number(e.target.value))} min="0" max="50" />
                                    </div>
                                </div>
                            )}

                            {strategy === 'MACD' && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    Les paramètres MACD standards (12, 26, 9) sont utilisés.
                                </div>
                            )}

                            {strategy === 'MULTI_CONFIRM' && (
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    Cette stratégie combine l'oscillateur MACD, un filtre de tendance SMA (10/50), et le RSI (14, 30/70) pour fournir des entrées de haute précision.
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={isLoading} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', fontSize: '1.125rem', fontWeight: 600 }}>
                            <Play size={20} />
                            {isLoading ? 'Calcul en cours...' : 'Lancer le Backtest'}
                        </button>
                    </form>
                </div>

                {/* Results Panel */}
                <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {!result && !isLoading && (
                        <div style={{ height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '1rem', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
                            Configurez et lancez un backtest pour voir les résultats.
                        </div>
                    )}

                    {isLoading && (
                        <div style={{ height: '100%', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <div style={{ color: 'var(--text-muted)' }}>Simulation de la stratégie sur les données historiques...</div>
                            </div>
                        </div>
                    )}

                    {result && (
                        <>
                            {/* KPI Cards */}
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1 1 200px', backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <DollarSign size={16} /> Capital Final
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: result.finalEquity >= result.initialCapital ? 'var(--success)' : 'var(--danger)' }}>
                                        ${Number(result.finalEquity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: result.finalEquity >= result.initialCapital ? 'var(--success)' : 'var(--danger)', marginTop: '0.5rem' }}>
                                        {result.totalReturn} de rendement
                                    </div>
                                </div>
                                <div style={{ flex: '1 1 200px', backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingUp size={16} /> Win Rate
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                        {result.metrics.winRate}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Sur {result.tradesCount} trades exécutés
                                    </div>
                                </div>
                                <div style={{ flex: '1 1 200px', backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <TrendingDown size={16} /> Drawdown Max
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>
                                        -{Number(result.metrics.maxDrawdown?.value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}%
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Frais payés: ${Number(result.totalFees).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Charts */}
                            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Graphique de Prix & Signaux</h3>
                                <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />

                                {result.indicators?.rsi?.length > 0 && (
                                    <div ref={rsiContainerRef} style={{ width: '100%', height: '150px' }} />
                                )}

                                {result.indicators?.macdLine?.length > 0 && (
                                    <div ref={macdContainerRef} style={{ width: '100%', height: '150px' }} />
                                )}
                            </div>

                            {/* Recent Trades Table (Top 10) */}
                            <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Derniers Trades Simulés</h3>
                                {result.trades.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)' }}>Aucun trade n'a passé les signaux de cette stratégie.</p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Type</th>
                                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Prix</th>
                                                    <th style={{ padding: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>Équité après</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[...result.trades].reverse().slice(0, 10).map((t: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.875rem' }}>
                                                            {new Date(t.timestamp).toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 600, color: t.type === 'BUY' ? 'var(--success)' : 'var(--danger)', fontSize: '0.875rem' }}>
                                                            {t.type}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right', fontSize: '0.875rem' }}>
                                                            ${Number(t.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'right', fontSize: '0.875rem' }}>
                                                            ${Number(t.equity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {result.trades.length > 10 && (
                                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                Affichage des 10 derniers trades sur {result.trades.length}.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
