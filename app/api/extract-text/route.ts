import { NextRequest } from 'next/server';
import { createWorker } from 'tesseract.js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string || 'eng';

    // Basic validation
    if (!file) {
      return Response.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return Response.json({ 
        success: false, 
        error: 'Only PDF files are allowed' 
      }, { status: 400 });
    }

    console.log('Starting OCR for:', file.name);

    // SIMPLE OCR - Just extract text directly from PDF
    // Note: This works for text-based PDFs, not scanned ones
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Convert PDF buffer to text (simple approach)
    const text = await extractTextFromPDF(buffer, language);

    return Response.json({
      success: true,
      text: text,
      pages: 1, // Simple version - assume 1 page
      fileName: file.name,
      message: "✅ OCR completed successfully!"
    });

  } catch (error) {
    console.error('Error:', error);
    return Response.json({ 
      success: false, 
      error: 'OCR processing failed. Try a text-based PDF file.' 
    }, { status: 500 });
  }
}

// Simple text extraction function
async function extractTextFromPDF(buffer: Buffer, language: string): Promise<string> {
  try {
    // For now, use a simple approach
    // We'll enhance this step by step
    
    // Convert buffer to text (basic OCR)
    const worker = await createWorker(language);
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    
    return text || "No text could be extracted. Try a different PDF file.";
  } catch (error) {
    throw new Error('Text extraction failed');
  }
}

export async function GET() {
  return Response.json({
    message: 'PDF OCR Text Extraction API',
    instructions: 'POST a PDF file to extract text',
    note: 'Works best with text-based PDFs (not scanned images)'
  });
}


// import { NextRequest } from 'next/server';
// import { PDFController } from '../../../lib/controllers/pdfController';

// export async function POST(request: NextRequest) {
//   const controller = new PDFController();
//   return await controller.extractText(request);
// }

// export async function GET() {
//   return new Response(JSON.stringify({
//     message: 'Use POST method with a PDF file to extract text',
//     example: {
//       method: 'POST',
//       url: '/api/extract-text',
//       body: 'multipart/form-data with "file" (PDF) and optional "language" fields'
//     },
//     supportedLanguages: ['eng', 'hin', 'eng+hin']
//   }), {
//     status: 200,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
// }