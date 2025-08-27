import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { Socket } from 'socket.io';
import { UserService, CognitoUserData } from '../services/userService';

// JWT verification configuration
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'id',
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export interface AuthenticatedSocket extends Socket {
  data: {
    user: any;
    dbUser: any;
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

    // Extract Cognito user data
    const cognitoData: CognitoUserData = {
      ...payload,
      sub: payload.sub,
      email: payload.email as string,
      email_verified: payload.email_verified as boolean,
      phone_number: payload.phone_number as string,
      phone_number_verified: payload.phone_number_verified as boolean,
      given_name: payload.given_name as string,
      family_name: payload.family_name as string,
      username: payload['cognito:username'] as string,
    };

    // Get or create user in database with full sync
    const dbUser = await UserService.getOrCreateUser(payload.sub, cognitoData);

    (socket as AuthenticatedSocket).data.dbUser = dbUser;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    next(new Error('Authentication error'));
  }
};

export const getCurrentUser = (socket: AuthenticatedSocket) => {
  return socket.data.user;
};

export const getCurrentDbUser = (socket: AuthenticatedSocket) => {
  return socket.data.dbUser;
};
