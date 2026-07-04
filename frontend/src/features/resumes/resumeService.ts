import api from '../../services/api';
import type { Resume, UploadPayload } from './types';

export const resumeService = {
  /** POST /api/resumes */
  upload: (payload: UploadPayload, onUploadProgress?: (progressEvent: any) => void): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    if (payload.label) {
      formData.append('label', payload.label);
    }
    return api
      .post<Resume>('/api/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      })
      .then(r => r.data);
  },

  /** GET /api/resumes */
  list: (): Promise<Resume[]> =>
    api.get<Resume[]>('/api/resumes').then(r => r.data),

  /** GET /api/resumes/{id}/download */
  download: async (id: string, filename: string): Promise<void> => {
    const response = await api.get(`/api/resumes/${id}/download`, {
      responseType: 'blob', // Important for file downloads
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /** PATCH /api/resumes/{id}/active */
  setActive: (id: string): Promise<Resume> =>
    api.patch<Resume>(`/api/resumes/${id}/active`).then(r => r.data),

  /** DELETE /api/resumes/{id} */
  delete: (id: string): Promise<void> =>
    api.delete(`/api/resumes/${id}`).then(() => undefined),
};
