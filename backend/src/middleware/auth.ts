import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Socket } from 'socket.io';

// JWT verification configuration
const verifier = CognitoJwtVerifier.create({
  userPoolId: 'us-east-1_PIG8yV895',
  tokenUse: 'id',
  clientId: '5ek2a00qgbfhns0d31p6utfdbq',
});

export interface AuthenticatedSocket extends Socket {
  data: {
    user: any;
  };
}

export const authenticateSocket = async (socket: Socket, next: (err?: Error) => void) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error('No token provided');
    }
    
    const payload = await verifier.verify(token);
    (socket as AuthenticatedSocket).data.user = payload;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
};

export const getCurrentUser = (socket: AuthenticatedSocket) => {
  return socket.data.user;
};
