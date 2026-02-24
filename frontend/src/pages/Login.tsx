import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const setTokens = useAuthStore(state => state.setTokens);
    const fetchProfile = useAuthStore(state => state.fetchProfile);
    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axiosInstance.post('/auth/login', { email, password });

            // L'API renvoie { data: { accessToken, refreshToken, expiresIn } }
            const payload = res.data.data;
            setTokens(payload.accessToken, payload.refreshToken);

            await fetchProfile();
            toast.success('Connexion réussie !');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Identifiants invalides');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Connexion</h1>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Adresse Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@trading.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                        {isLoading ? 'Chargement...' : 'Se connecter'}
                    </button>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                        Pas encore de compte ? <Link to="/register">S'inscrire</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
