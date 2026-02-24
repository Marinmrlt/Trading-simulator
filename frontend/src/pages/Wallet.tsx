import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';
import type { IChartApi } from 'lightweight-charts';
import axiosInstance from '../api/axios';
import { Wallet as WalletIcon, History, CreditCard } from 'lucide-react';

export default function WalletPage() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    const [portfolio, setPortfolio] = useState<{ totalValueUSD: number, wallets: any[] } | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [portfolioRes, txRes, equityRes] = await Promise.all([
                    axiosInstance.get('/wallet/portfolio'),
                    axiosInstance.get('/wallet/transactions'),
                    axiosInstance.get('/wallet/equity-curve?days=30')
                ]);

                setPortfolio(portfolioRes.data.data);
                setTransactions(txRes.data.data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

                // Setup Chart if data exists
                if (chartContainerRef.current && equityRes.data.data) {
                    if (chartRef.current) {
                        chartRef.current.remove();
                    }

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
                        height: 300,
                    });

                    chartRef.current = chart;
                    const lineSeries = chart.addSeries(LineSeries, {
                        color: '#3b82f6',
                        lineWidth: 2,
                    });

                    const equityData = equityRes.data.data.map((point: any) => ({
                        time: Math.floor(new Date(point.timestamp).getTime() / 1000),
                        value: Number(point.totalValueUSD)
                    })).sort((a: any, b: any) => a.time - b.time);

                    if (equityData.length > 0) {
                        lineSeries.setData(equityData);
                        chart.timeScale().fitContent();
                    }
                }
            } catch (error) {
                console.error('Failed to load wallet data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, []);

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement du portefeuille...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <WalletIcon size={28} color="var(--primary)" />
                    Mon Portefeuille
                </h1>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    ${portfolio?.totalValueUSD !== undefined ? Number(portfolio.totalValueUSD).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                </div>
            </div>

            {/* Equity Curve Chart */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
            }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Évolution du capital (30 jours)</h3>
                <div ref={chartContainerRef} style={{ width: '100%', height: '300px' }} />
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                {/* Assets List */}
                <div style={{ flex: '1 1 300px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CreditCard size={20} color="var(--primary)" />
                        Mes Actifs
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {portfolio?.wallets?.map((wallet: any) => (
                            <div key={wallet.currency} style={{
                                backgroundColor: 'var(--bg-card)',
                                padding: '1.25rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1.125rem' }}>{wallet.currency}</h4>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        Disponible: {Number(wallet.available).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                        {wallet.locked > 0 && ` (Bloqué: ${Number(wallet.locked).toLocaleString()})`}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                                        {Number(wallet.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        ≈ ${Number(wallet.valueUSD || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {portfolio?.wallets?.length === 0 && (
                            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Aucun actif.</div>
                        )}
                    </div>
                </div>

                {/* Transactions History */}
                <div style={{ flex: '1 1 400px' }}>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={20} color="var(--primary)" />
                        Historique des Transactions
                    </h2>
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '0.75rem',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            {transactions.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune transaction trouvée.</div>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', position: 'sticky', top: 0 }}>
                                        <tr>
                                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Date</th>
                                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Type</th>
                                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Montant</th>
                                            <th style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.875rem' }}>Prix d'exéc.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.map((tx: any) => {
                                            // For simplicity, we just color code BUY/SELL/DEPOSIT/WITHDRAWAL
                                            let typeColor = 'var(--text-main)';
                                            if (tx.type === 'BUY') typeColor = 'var(--success)';
                                            if (tx.type === 'SELL') typeColor = 'var(--danger)';
                                            if (tx.type === 'DEPOSIT') typeColor = '#3b82f6';

                                            return (
                                                <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                        {new Date(tx.timestamp).toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: typeColor }}>
                                                        {tx.type}
                                                    </td>
                                                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                                        {Number(tx.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })} {tx.currency}
                                                    </td>
                                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                        {tx.price ? `$${Number(tx.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
