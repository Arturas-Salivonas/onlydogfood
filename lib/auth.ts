import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getServiceSupabase } from './supabase';

// CRITICAL: Set ADMIN_JWT_SECRET in your .env.local file for production!
// The default value is ONLY for local development and MUST be changed in production
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'your-secret-key-change-in-production'
);

// Validate that JWT secret is properly configured in production
if (process.env.NODE_ENV === 'production' && process.env.ADMIN_JWT_SECRET === 'your-secret-key-change-in-production') {
  throw new Error('CRITICAL SECURITY ERROR: ADMIN_JWT_SECRET must be set to a secure random value in production!');
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
}

export async function createToken(user: AdminUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload.user as AdminUser;
  } catch (error) {
    return null;
  }
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminUser | null> {
  const supabase = getServiceSupabase();

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (!adminUser) {
    return null;
  }

  // SECURITY WARNING: This uses plain text password comparison
  // In production, you MUST use bcrypt or similar hashing:
  // const bcrypt = require('bcryptjs');
  // const isValid = await bcrypt.compare(password, adminUser.password_hash);
  if (adminUser.password_hash !== password) {
    return null;
  }

  return {
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
  };
}
