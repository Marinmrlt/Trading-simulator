import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CandlestickSeries } from 'lightweight-charts';
import type { IChartApi, ISeriesApi } from 'lightweight-charts';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeftRight } from 'lucide-react';

export default function Trading() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

    const [symbol, setSymbol] = useState('BTC/USD');
    const [assets, setAssets] = useState<any[]>([]);
    const [amount, setAmount] = useState('');
    const [orderType, setOrderType] = useState('MARKET');
    const [side, setSide] = useState('BUY');
    const [isLoading, setIsLoading] = useState(false);

    // Fetch assets list
    useEffect(() => {
        axiosInstance.get('/market/assets').then(res => {
            setAssets(res.data.data);
        }).catch(err => console.error(err));
    }, []);

    // Load chart data
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#1e293b' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: '#334155' },
                horzLines: { color: '#334155' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
        });

        chartRef.current = chart;
        const candlestickSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#10b981',
            wickDownColor: '#ef4444',
        });
        seriesRef.current = candlestickSeries;

        // Fetch Candles
        let isMounted = true;
        axiosInstance.get(`/market/candles?symbol=${symbol}&timeframe=1h`)
            .then(res => {
                if (!isMounted) return;
                const data = res.data.data.map((c: any) => ({
                    time: Math.floor(new Date(c.timestamp).getTime() / 1000),
                    open: Number(c.open),
                    high: Number(c.high),
                    low: Number(c.low),
                    close: Number(c.close),
                })).sort((a: any, b: any) => a.time - b.time); // Lightweight charts requires sorted data

                candlestickSeries.setData(data);
                chart.timeScale().fitContent();
            })
            .catch(err => console.error('Failed to load chart data', err));

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            isMounted = false;
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [symbol]);

    const handleOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return toast.error('Veuillez entrer un montant valide');

        setIsLoading(true);
        try {
            await axiosInstance.post('/trade/order', {
                symbol,
                side,
                type: orderType,
                amount: Number(amount),
                price: orderType === 'LIMIT' ? 100000 : undefined // simplified
            });
            toast.success('Ordre exécuté avec succès');
            setAmount('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors du passage d\'ordre');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Chart Section */}
            <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Terminal de Trading</h1>
                    <select
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-card)', color: 'white', border: '1px solid var(--border-color)' }}
                    >
                        {assets.map(a => <option key={a.symbol} value={a.symbol}>{a.symbol}</option>)}
                    </select>
                </div>

                <div
                    ref={chartContainerRef}
                    style={{
                        width: '100%',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        border: '1px solid var(--border-color)'
                    }}
                />
            </div>

            {/* Order Form Section */}
            <div style={{ flex: '1 1 300px' }}>
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ArrowLeftRight size={20} color="var(--primary)" />
                        Passer un ordre
                    </h3>

                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setSide('BUY')}
                            style={{
                                flex: 1,
                                backgroundColor: side === 'BUY' ? 'var(--success)' : 'transparent',
                                border: `1px solid ${side === 'BUY' ? 'var(--success)' : 'var(--border-color)'}`,
                                color: side === 'BUY' ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            Acheter
                        </button>
                        <button
                            onClick={() => setSide('SELL')}
                            style={{
                                flex: 1,
                                backgroundColor: side === 'SELL' ? 'var(--danger)' : 'transparent',
                                border: `1px solid ${side === 'SELL' ? 'var(--danger)' : 'var(--border-color)'}`,
                                color: side === 'SELL' ? 'white' : 'var(--text-muted)'
                            }}
                        >
                            Vendre
                        </button>
                    </div>

                    <form onSubmit={handleOrder}>
                        <div className="form-group">
                            <label>Type d'ordre</label>
                            <select
                                value={orderType}
                                onChange={(e) => setOrderType(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#0f172a', color: 'white', border: '1px solid var(--border-color)' }}
                            >
                                <option value="MARKET">Market (Au marché)</option>
                                <option value="LIMIT">Limit</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quantité ({symbol.split('/')[0]})</label>
                            <input
                                type="number"
                                step="0.0001"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                marginTop: '1rem',
                                backgroundColor: side === 'BUY' ? 'var(--success)' : 'var(--danger)',
                                color: 'white',
                                opacity: isLoading ? 0.7 : 1
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'En cours...' : `${side === 'BUY' ? 'Acheter' : 'Vendre'} ${symbol}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
