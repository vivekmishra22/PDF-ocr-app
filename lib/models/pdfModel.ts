export interface ExtractionResult {
  success: boolean;
  text: string;
  error?: string;
  pages?: number;
}

export interface OCRProgress {
  page: number;
  totalPages: number;
  status: 'converting' | 'extracting' | 'completed' | 'error';
}