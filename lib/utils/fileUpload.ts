import { NextRequest } from 'next/server';

export interface UploadedFile {
  originalName: string;
  buffer: Buffer;
  mimetype: string;
}

export async function handleFileUpload(request: NextRequest): Promise<UploadedFile> {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    throw new Error('No file uploaded');
  }

  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files are allowed');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return {
    originalName: file.name,
    buffer,
    mimetype: file.type
  };
}