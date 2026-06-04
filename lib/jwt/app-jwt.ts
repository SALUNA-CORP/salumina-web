import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.APP_JWT_SECRET!);

export interface AppTokenPayload {
  userId: string;
  email: string;
  bookmakers: string[];
  expiresAt: string;
  status: 'active' | 'expired' | 'inactive';
}

export async function signAppToken(payload: AppTokenPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret);

  return token;
}

export async function verifyAppToken(token: string): Promise<AppTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AppTokenPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
}
