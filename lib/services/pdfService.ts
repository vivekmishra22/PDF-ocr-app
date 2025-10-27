import { PDFDocument } from 'pdf-lib';
import { fromBuffer } from 'pdf2pic';
import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

export class PDFService {
  async convertPDFToImages(pdfBuffer: Buffer, outputDir: string): Promise<string[]> {
    try {
      // Use pdf2pic for PDF to image conversion
      const options = {
        density: 300,           // High resolution for better OCR
        saveFilename: "page",   // Base filename
        savePath: outputDir,    // Output directory
        format: "png",          // Output format
        width: 1654,            // A4 width at 300 DPI
        height: 2339            // A4 height at 300 DPI
      };

      const convert = fromBuffer(pdfBuffer, options);
      const result = await convert.bulk(-1, { responseType: "image" }); // Convert all pages

      return result.map((page: any, index: number) => 
        path.join(outputDir, `page.${index + 1}.png`)
      );
    } catch (error) {
      throw new Error(`PDF to image conversion failed: ${error}`);
    }
  }

  async extractTextFromImage(imagePath: string, language: string = 'eng'): Promise<string> {
    try {
      // Pre-process image for better OCR
      const processedImageBuffer = await sharp(imagePath)
        .resize(2000)           // Resize for better OCR
        .grayscale()           // Convert to grayscale
        .normalize()           // Enhance contrast
        .sharpen()             // Sharpen image
        .toBuffer();

      // Initialize Tesseract worker
      const worker = await createWorker(language);
      
      try {
        const { data: { text } } = await worker.recognize(processedImageBuffer);
        return text.trim();
      } finally {
        await worker.terminate();
      }
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error}`);
    }
  }

  async extractTextFromPDF(pdfBuffer: Buffer, language: string = 'eng'): Promise<{ text: string; pages: number }> {
    const tempDir = path.join(os.tmpdir(), `pdf-ocr-${Date.now()}`);
    
    try {
      await fs.mkdir(tempDir, { recursive: true });

      // Convert PDF to images
      console.log('Converting PDF to images...');
      const imagePaths = await this.convertPDFToImages(pdfBuffer, tempDir);
      
      if (imagePaths.length === 0) {
        throw new Error('No pages found in PDF');
      }

      console.log(`Found ${imagePaths.length} pages`);

      // Extract text from each page
      let fullText = '';
      for (let i = 0; i < imagePaths.length; i++) {
        console.log(`Processing page ${i + 1}/${imagePaths.length}`);
        try {
          const pageText = await this.extractTextFromImage(imagePaths[i], language);
          fullText += `--- Page ${i + 1} ---\n${pageText}\n\n`;
        } catch (pageError) {
          console.error(`Error processing page ${i + 1}:`, pageError);
          fullText += `--- Page ${i + 1} ---\n[Error extracting text from this page]\n\n`;
        }
      }

      return {
        text: fullText,
        pages: imagePaths.length
      };

    } finally {
      // Cleanup temporary files
      await this.cleanup(tempDir);
    }
  }

  private async cleanup(tempDir: string): Promise<void> {
    try {
      const files = await fs.readdir(tempDir);
      await Promise.all(files.map(file => 
        fs.unlink(path.join(tempDir, file)).catch(() => {})
      ));
      await fs.rmdir(tempDir).catch(() => {});
    } catch (error) {
      console.warn('Cleanup warning:', error);
    }
  }
}