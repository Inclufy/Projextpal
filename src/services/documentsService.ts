import { apiService } from './apiService';

export interface Document {
  id: string;
  name: string;
  file_type: string;
  size: number;
  uploaded_by?: string;
  uploaded_by_name?: string;
  project?: string;
  project_name?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

class DocumentsService {
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await apiService.get<any>('/api/v1/documents/');
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      return [];
    }
  }

  async getDocumentById(id: string): Promise<Document | null> {
    try {
      return await apiService.get(`/api/v1/documents/${id}/`);
    } catch (error) {
      console.error('Failed to fetch document:', error);
      return null;
    }
  }
}

export const documentsService = new DocumentsService();
