import { NextResponse } from 'next/server';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const { token } = await req.json();
  try {
    const response = await fetch(`${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return NextResponse.json({ isValid: true });
    } else {
      return NextResponse.json({ isValid: false });
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json({ isValid: false, error: 'Token validation failed' });
  }
}