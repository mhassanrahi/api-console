import React, { useState } from 'react';
import { confirmSignUp } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';

const VerifyEmail: React.FC<{
  setScreen: (s: AuthScreen) => void;
  email: string;
}> = ({ setScreen, email }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setSuccess(true);
      setTimeout(() => setScreen('login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify}>
      <h2>Verify Email</h2>
      <input
        type='text'
        placeholder='Verification Code'
        value={code}
        onChange={e => setCode(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button
        type='submit'
        disabled={loading}
        style={{ width: '100%', padding: 10 }}
      >
        {loading ? 'Verifying...' : 'Verify'}
      </button>
      {success && (
        <div style={{ color: 'green', marginTop: 8 }}>
          Verified! Redirecting to login...
        </div>
      )}
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <button
          type='button'
          onClick={() => setScreen('login')}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
          }}
        >
          Back to Login
        </button>
      </div>
    </form>
  );
};

export default VerifyEmail;
