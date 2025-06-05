import axios from 'axios';
import { useState, type FormEvent } from 'react';

interface RegisterProps {
    onRegister: (token: string) => void;
    onSwitchToLogin: () => void;
}

export default function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await axios.post('http://localhost:5000/api/register', {
                username,
                password,
            });

            const data = res.data; 
            onRegister(data.token); 
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    style={{ width: '100%', marginBottom: 10, padding: 8 }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', marginBottom: 10, padding: 8 }}
                />
                <button type="submit" style={{ padding: '8px 16px' }}>
                    Register
                </button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
            <p style={{ marginTop: 10 }}>
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} style={{ color: 'blue', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Login here
                </button>
            </p>
        </div>
    );
}
