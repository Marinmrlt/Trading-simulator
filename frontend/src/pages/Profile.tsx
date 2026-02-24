import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useAuthStore } from '../store/useAuthStore';
import { User, ShieldAlert, RotateCcw, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
    const user = useAuthStore(state => state.user);
    const [riskSettings, setRiskSettings] = useState({ maxPositionSizePercent: 25, dailyLossLimit: 1000 });
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        axiosInstance.get('/trade/risk').then(res => {
            setRiskSettings({
                maxPositionSizePercent: res.data.data.maxPositionSizePercent || 25,
                dailyLossLimit: res.data.data.dailyLossLimit || 1000
            });
        }).catch(err => console.error('Error fetching risk settings', err));
    }, []);

    const handleSaveRisk = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await axiosInstance.put('/trade/risk', {
                maxPositionSizePercent: Number(riskSettings.maxPositionSizePercent),
                dailyLossLimit: Number(riskSettings.dailyLossLimit)
            });
            toast.success('Paramètres de risque mis à jour');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setIsSaving(false);
        }
    };

    const handleResetAccount = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir réinitialiser votre compte ? Cette action supprimera tous vos soldes et transactions et vous redonnera 10 000$.")) return;

        setIsResetting(true);
        try {
            await axiosInstance.post('/wallet/reset');
            toast.success('Compte réinitialisé avec succès. Vous avez de nouveau 10 000$.');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de la réinitialisation');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
            <div>
                <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <User size={28} color="var(--primary)" />
                    Mon Profil
                </h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Gérez vos informations personnelles et vos limites de risque.</p>
            </div>

            {/* User Info Card */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
            }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Informations Personnelles</h2>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Prénom</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 500, padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>{user?.firstName}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Nom</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 500, padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>{user?.lastName}</div>
                    </div>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Email</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 500, padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>{user?.email}</div>
                </div>
            </div>

            {/* Risk Management */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--border-color)',
            }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldAlert size={20} color="#fbbf24" />
                    Gestion du Risque
                </h2>
                <form onSubmit={handleSaveRisk} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Taille max par position (%)</label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={riskSettings.maxPositionSizePercent}
                                onChange={e => setRiskSettings({ ...riskSettings, maxPositionSizePercent: Number(e.target.value) })}
                            />
                            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>Pourcentage maximum du portefeuille alloué à un seul trade.</small>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Perte maximale quotidienne ($)</label>
                            <input
                                type="number"
                                min="0"
                                value={riskSettings.dailyLossLimit}
                                onChange={e => setRiskSettings({ ...riskSettings, dailyLossLimit: Number(e.target.value) })}
                            />
                            <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>Limite au-delà de laquelle vous ne pourrez plus trader aujourd'hui.</small>
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Save size={18} />
                            {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Danger Zone */}
            <div style={{
                backgroundColor: 'var(--bg-card)',
                padding: '1.5rem',
                borderRadius: '1rem',
                border: '1px solid var(--danger)',
            }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--danger)' }}>Zone de Danger</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Si vous avez fait de mauvaises décisions de trading, vous pouvez réinitialiser votre compte.
                    Vous perdrez tout votre historique ainsi que vos paires de portefeuilles, et recommencerez avec un solde virtuel de 10 000 USD.
                </p>
                <button
                    onClick={handleResetAccount}
                    disabled={isResetting}
                    style={{
                        backgroundColor: 'transparent',
                        border: '1px solid var(--danger)',
                        color: 'var(--danger)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--danger)'; }}
                >
                    <RotateCcw size={18} />
                    {isResetting ? 'Réinitialisation en cours...' : 'Réinitialiser mon compte (10 000$)'}
                </button>
            </div>
        </div>
    );
}
