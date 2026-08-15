// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';
import { NextResponse, NextRequest } from 'next/server';

export const GET = async (req: NextRequest) => {
  try {
    return await handlers.GET(req);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(
      new URL('/auth/error?error=AuthFailed', req.url)
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    return await handlers.POST(req);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(
      new URL('/auth/error?error=AuthFailed', req.url)
    );
  }
};