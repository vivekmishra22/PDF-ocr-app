import { NextRequest } from 'next/server';
import { PDFController } from '../../../lib/controllers/pdfController';

export async function POST(request: NextRequest) {
  const controller = new PDFController();
  return await controller.extractText(request);
}

export async function GET() {
  return new Response(JSON.stringify({
    message: 'Use POST method with a PDF file to extract text',
    example: {
      method: 'POST',
      url: '/api/extract-text',
      body: 'multipart/form-data with "file" (PDF) and optional "language" fields'
    },
    supportedLanguages: ['eng', 'hin', 'eng+hin']
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}