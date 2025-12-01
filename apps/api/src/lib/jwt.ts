import { SignJWT, jwtVerify, JWTPayload } from 'jose';

// Token expiration times
export const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

/**
 * Generate a cryptographically secure JWT token using HMAC-SHA256
 */
export async function generateToken(
  payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>,
  secret: string,
  type: 'access' | 'refresh' = 'access'
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  const expiry = type === 'access' ? ACCESS_TOKEN_EXPIRY : REFRESH_TOKEN_EXPIRY;

  const token = await new SignJWT({ ...payload, type })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiry)
    .setIssuer('legaldocs')
    .setAudience('legaldocs-api')
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<TokenPayload> {
  const secretKey = new TextEncoder().encode(secret);

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: 'legaldocs',
      audience: 'legaldocs-api',
    });

    return payload as TokenPayload;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new TokenError('TOKEN_EXPIRED', 'Token has expired');
      }
      if (error.message.includes('signature')) {
        throw new TokenError('INVALID_SIGNATURE', 'Invalid token signature');
      }
    }
    throw new TokenError('INVALID_TOKEN', 'Invalid token');
  }
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(
  payload: Omit<TokenPayload, 'type' | 'iat' | 'exp'>,
  secret: string
): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }> {
  const [accessToken, refreshToken] = await Promise.all([
    generateToken(payload, secret, 'access'),
    generateToken(payload, secret, 'refresh'),
  ]);

  // Calculate expiration timestamp (15 minutes from now)
  const expiresAt = Date.now() + 15 * 60 * 1000;

  return { accessToken, refreshToken, expiresAt };
}

/**
 * Custom error class for token-related errors
 */
export class TokenError extends Error {
  constructor(
    public code: 'TOKEN_EXPIRED' | 'INVALID_TOKEN' | 'INVALID_SIGNATURE' | 'MISSING_TOKEN',
    message: string
  ) {
    super(message);
    this.name = 'TokenError';
  }
}
