import React, { useState } from 'react';
import Login from './Login.tsx';
import SignUp from './SignUp.tsx';
import ForgotPassword from './ForgotPassword.tsx';
import VerifyEmail from './VerifyEmail.tsx';

export type AuthScreen = 'login' | 'signup' | 'forgot' | 'verify';

const AuthContainer: React.FC = () => {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [email, setEmail] = useState('');

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '40px auto',
        background: '#fff',
        padding: 32,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      {screen === 'login' && (
        <Login setScreen={setScreen} setEmail={setEmail} />
      )}
      {screen === 'signup' && (
        <SignUp setScreen={setScreen} setEmail={setEmail} />
      )}
      {screen === 'forgot' && (
        <ForgotPassword setScreen={setScreen} email={email} />
      )}
      {screen === 'verify' && (
        <VerifyEmail setScreen={setScreen} email={email} />
      )}
    </div>
  );
};

export default AuthContainer;
