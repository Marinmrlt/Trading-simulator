import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axiosInstance.post('/auth/register', {
                email, password, firstName, lastName
            });
            toast.success('Compte créé avec succès ! Vous pouvez vous connecter.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erreur lors de la création');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Inscription</h1>
                <form onSubmit={onSubmit}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Prénom</label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="John"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Nom</label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Adresse Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 caractères"
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                        {isLoading ? 'Création...' : 'Créer mon compte'}
                    </button>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                        Déjà un compte ? <Link to="/login">Se connecter</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
