import React, { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';

const SignUp: React.FC<{
  setScreen: (s: AuthScreen) => void;
  setEmail: (e: string) => void;
}> = ({ setScreen, setEmail }) => {
  const [email, setEmailLocal] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signUp({
        username: email,
        password,
        options: { userAttributes: { email } },
      });
      setEmail(email);
      setScreen('verify');
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp}>
      <h2>Sign Up</h2>
      <input
        type='email'
        placeholder='Email'
        value={email}
        onChange={e => {
          setEmailLocal(e.target.value);
          setEmail(e.target.value);
        }}
        required
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      <input
        type='password'
        placeholder='Password'
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 12, padding: 8 }}
      />
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button
        type='submit'
        disabled={loading}
        style={{ width: '100%', padding: 10 }}
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <span>Already have an account? </span>
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
          Login
        </button>
      </div>
    </form>
  );
};

export default SignUp;
