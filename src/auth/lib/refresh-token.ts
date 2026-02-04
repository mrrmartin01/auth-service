import { randomBytes, createHmac } from 'crypto';

export function generateRefreshToken(): string {
  return randomBytes(64).toString('base64url');
}

export function hashRefreshToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}
