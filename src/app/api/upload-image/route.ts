import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const filename = file.name;

  try {
    const { url } = await put(filename, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Add this to handle GET requests (optional, for debugging)
export async function GET() {
  return NextResponse.json({ message: 'Use POST to upload an image' }, { status: 405 });
}