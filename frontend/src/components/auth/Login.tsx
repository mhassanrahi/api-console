import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';

const Login: React.FC<{ setScreen: (s: AuthScreen) => void; setEmail: (e: string) => void }> = ({ setScreen, setEmail }) => {
  const [email, setEmailLocal] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn({username: email, password});
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => { setEmailLocal(e.target.value); setEmail(e.target.value); }}
        required
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      <div style={{ marginTop: 12, textAlign: 'right' }}>
        <button type="button" onClick={() => setScreen('forgot')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>Forgot password?</button>
      </div>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <span>Don't have an account? </span>
        <button type="button" onClick={() => setScreen('signup')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>Sign up</button>
      </div>
    </form>
  );
};

export default Login;
