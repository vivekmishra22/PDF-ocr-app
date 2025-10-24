import { NextRequest, NextResponse } from 'next/server';
import { PDFService } from '../services/pdfService';
import { handleFileUpload } from '../utils/fileUpload';
import { ExtractionResult } from '../models/pdfModel';

export class PDFController {
  private pdfService: PDFService;

  constructor() {
    this.pdfService = new PDFService();
  }

  async extractText(request: NextRequest): Promise<NextResponse<ExtractionResult>> {
    try {
      // Handle file upload
      const uploadedFile = await handleFileUpload(request);
      
      // Get language parameter (optional)
      const formData = await request.formData();
      const language = formData.get('language') as string || 'eng';

      console.log(`Processing PDF: ${uploadedFile.originalName}, Language: ${language}`);

      // Extract text from PDF
      const { text, pages } = await this.pdfService.extractTextFromPDF(
        uploadedFile.buffer, 
        language
      );

      return NextResponse.json({
        success: true,
        text: text,
        pages: pages
      });

    } catch (error) {
      console.error('Extraction error:', error);
      
      return NextResponse.json({
        success: false,
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }, { status: 400 });
    }
  }
}