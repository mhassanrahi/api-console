import React, { useState } from 'react';
import { resetPassword } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';

const ForgotPassword: React.FC<{ setScreen: (s: AuthScreen) => void; email: string }> = ({ setScreen, email }) => {
  const [emailInput, setEmailInput] = useState(email);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword({username: emailInput});
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleForgot}>
      <h2>Forgot Password</h2>
      <input
        type="email"
        placeholder="Email"
        value={emailInput}
        onChange={e => setEmailInput(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
        {loading ? 'Sending...' : 'Send Reset Code'}
      </button>
      {sent && <div style={{ color: 'green', marginTop: 8 }}>Reset code sent! Check your email.</div>}
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <button type="button" onClick={() => setScreen('login')} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>Back to Login</button>
      </div>
    </form>
  );
};

export default ForgotPassword;
