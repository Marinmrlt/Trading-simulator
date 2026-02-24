import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { TrendingUp, Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard() {
    const user = useAuthStore(state => state.user);
    const [portfolio, setPortfolio] = useState<{ totalValueUSD: number, wallets: any[] } | null>(null);
    const [assets, setAssets] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [portfolioRes, assetsRes] = await Promise.all([
                    axiosInstance.get('/wallet/portfolio'),
                    axiosInstance.get('/market/assets')
                ]);
                setPortfolio(portfolioRes.data.data);
                setAssets(assetsRes.data.data.slice(0, 4)); // Only show top 4
            } catch (error) {
                console.error('Error fetching dashboard data', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Bienvenue, {user?.firstName}</h1>
                <p style={{ color: 'var(--text-muted)' }}>Voici le résumé de votre activité de trading aujourd'hui.</p>
            </div>

            {/* Portfolio Card */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem'
            }}>
                <div style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    padding: '1rem',
                    borderRadius: '50%'
                }}>
                    <WalletIcon size={32} color="var(--primary)" />
                </div>
                <div>
                    <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Valeur Portefeuille (USD)</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>
                        ${portfolio?.totalValueUSD !== undefined ? Number(portfolio.totalValueUSD).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                    </div>
                </div>
            </div>

            {/* Markets Grid */}
            <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={20} color="var(--primary)" />
                    Marchés tendances
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1rem'
                }}>
                    {assets.map(asset => {
                        const isPositive = asset.change24h >= 0;
                        return (
                            <div key={asset.symbol} style={{
                                backgroundColor: 'var(--bg-card)',
                                padding: '1.25rem',
                                borderRadius: '0.75rem',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600 }}>{asset.symbol}</span>
                                    <span style={{
                                        color: isPositive ? 'var(--success)' : 'var(--danger)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>
                                        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {Math.abs(Number(asset.change24h || 0))}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                                    ${Number(asset.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
