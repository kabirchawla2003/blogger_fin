// lib/auth.ts
import { NextRequest } from 'next/server';

export function validateAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.slice(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  return username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD;
}

export function createAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}
export function getAuthErrorResponse(): Response {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
    },
  });
}