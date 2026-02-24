import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { Trophy, TrendingUp, Hash } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const currentUser = useAuthStore(state => state.user);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axiosInstance.get('/trade/leaderboard');
                setLeaderboard(res.data.data);
            } catch (error) {
                console.error('Failed to load leaderboard', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Chargement du classement...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Trophy size={28} color="var(--primary)" />
                        Classement Global
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Les meilleurs traders classés par profitabilité cible.</p>
                </div>
            </div>

            <div style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
            }}>
                {leaderboard.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune donnée de classement pour le moment.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', position: 'sticky', top: 0 }}>
                            <tr>
                                <th style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500, width: '80px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Hash size={16} /> Rang
                                    </div>
                                </th>
                                <th style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500 }}>Trader ID</th>
                                <th style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <TrendingUp size={16} /> PnL Total (USD)
                                    </div>
                                </th>
                                <th style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'right' }}>Trades Complétés</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry: any, index: number) => {
                                const isCurrentUser = currentUser?.id === entry.userId;
                                const isPositivePnl = entry.totalPnl >= 0;

                                let rankColor = 'var(--text-muted)';
                                if (index === 0) rankColor = '#fbbf24'; // Gold
                                else if (index === 1) rankColor = '#94a3b8'; // Silver
                                else if (index === 2) rankColor = '#b45309'; // Bronze

                                return (
                                    <tr key={entry.userId} style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                        backgroundColor: isCurrentUser ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                        transition: 'background-color 0.2s'
                                    }}>
                                        <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '1.125rem', color: rankColor }}>
                                            #{index + 1}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    backgroundColor: `hsl(${(entry.userId.charCodeAt(0) * 30) % 360}, 70%, 50%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 'bold',
                                                    color: 'white',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {entry.userId.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span style={{ fontFamily: 'monospace', fontWeight: isCurrentUser ? 600 : 400, color: isCurrentUser ? 'var(--primary)' : 'inherit' }}>
                                                    {isCurrentUser ? 'Vous (Mon Compte)' : `Trader_${entry.userId.substring(0, 8)}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 600, color: isPositivePnl ? 'var(--success)' : 'var(--danger)', fontSize: '1.125rem' }}>
                                            {isPositivePnl ? '+' : ''}{Number(entry.totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2 })} $
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                                            {entry.trades}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
