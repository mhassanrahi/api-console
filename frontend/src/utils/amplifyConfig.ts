import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolClientId: '5ek2a00qgbfhns0d31p6utfdbq',
      userPoolId: 'us-east-1_PIG8yV895',
      loginWith: {
        oauth: {
          domain:
            'reactive-api-console-1755953825.auth.us-east-1.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['http://localhost:5173/'],
          redirectSignOut: ['http://localhost:5173/'],
          responseType: 'code',
        },
        username: true,
        email: false,
        phone: false,
      },
    },
  },
});
