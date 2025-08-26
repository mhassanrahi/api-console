import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Socket } from 'socket.io';

// JWT verification configuration
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'id',
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export interface AuthenticatedSocket extends Socket {
  data: {
    user: any;
  };
}

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error('No token provided');
    }

    const payload = await verifier.verify(token);
    (socket as AuthenticatedSocket).data.user = payload;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    next(new Error('Authentication error'));
  }
};

export const getCurrentUser = (socket: AuthenticatedSocket) => {
  return socket.data.user;
};
