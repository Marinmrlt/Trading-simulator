import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
    LayoutDashboard,
    LineChart,
    Wallet,
    Trophy,
    Settings,
    LogOut,
    Activity
} from 'lucide-react';

export default function Layout() {
    const location = useLocation();
    const logout = useAuthStore(state => state.logout);
    const user = useAuthStore(state => state.user);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/trade', label: 'Trading', icon: LineChart },
        { path: '/wallet', label: 'Portefeuille', icon: Wallet },
        { path: '/backtest', label: 'Backtest', icon: Activity },
        { path: '/leaderboard', label: 'Classement', icon: Trophy },
        { path: '/profile', label: 'Profil', icon: Settings },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: 'var(--bg-card)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h2 style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <LineChart color="var(--primary)" />
                        TradingSim.
                    </h2>
                </div>

                <nav style={{ flex: 1, padding: '1rem 0' }}>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.875rem 1.5rem',
                                    color: isActive ? 'white' : 'var(--text-muted)',
                                    backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    borderRight: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                                    fontWeight: isActive ? 600 : 400
                                }}
                            >
                                <Icon size={20} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        {user?.firstName} {user?.lastName}
                    </div>
                    <button
                        onClick={() => logout()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            backgroundColor: 'transparent',
                            color: 'var(--danger)',
                            padding: '0.5rem 0',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <LogOut size={18} />
                        Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <header style={{
                    height: '64px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 2rem',
                    backgroundColor: 'var(--bg-card)'
                }}>
                    <h3 style={{ margin: 0, fontWeight: 500, color: 'var(--text-muted)' }}>
                        {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Espace privé'}
                    </h3>
                </header>

                <div style={{ padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
