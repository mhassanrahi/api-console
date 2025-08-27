import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { UserService, CognitoUserData } from '../services/userService';

// JWT verification configuration
const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.COGNITO_USER_POOL_ID!,
  tokenUse: 'id',
  clientId: process.env.COGNITO_CLIENT_ID!,
});

export interface AuthenticatedRequest extends Request {
  user?: any;
  dbUser?: any;
}

export const authenticateRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔐 HTTP Auth: Processing request for endpoint:', req.path);
    const authHeader = req.headers.authorization;
    console.log('🔐 HTTP Auth: Authorization header present:', !!authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ HTTP Auth: No valid authorization header');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔐 HTTP Auth: Token extracted, length:', token.length);

    const payload = await verifier.verify(token);
    console.log('🔐 HTTP Auth: Token verified, user sub:', payload.sub);
    req.user = payload;

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
    req.dbUser = dbUser;

    next();
  } catch (err) {
    console.error('HTTP Authentication error:', err);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export const getCurrentUser = (req: AuthenticatedRequest) => {
  return req.user;
};

export const getCurrentDbUser = (req: AuthenticatedRequest) => {
  return req.dbUser;
};
