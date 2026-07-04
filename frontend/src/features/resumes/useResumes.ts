import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { resumeService } from './resumeService';
import type { Resume, UploadPayload } from './types';

export function useResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resumeService.list();
      setResumes(data);
    } catch {
      toast.error('Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadResume = useCallback(async (payload: UploadPayload): Promise<boolean> => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const created = await resumeService.upload(payload, (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      setResumes(prev => [created, ...prev]); // Add to top (newest first)
      toast.success('Resume uploaded successfully.');
      return true;
    } catch (error: any) {
      if (error.response?.status === 413) {
        toast.error('File size exceeds 10 MB limit.');
      } else {
        toast.error('Failed to upload resume.');
      }
      return false;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const setActive = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updated = await resumeService.setActive(id);
      setResumes(prev => prev.map(r => 
        r.id === updated.id ? updated : { ...r, isActive: false }
      ));
      toast.success('Active resume updated.');
      return true;
    } catch {
      toast.error('Failed to set active resume.');
      return false;
    }
  }, []);

  const deleteResume = useCallback(async (id: string): Promise<boolean> => {
    try {
      await resumeService.delete(id);
      setResumes(prev => prev.filter(r => r.id !== id));
      toast.success('Resume deleted.');
      return true;
    } catch {
      toast.error('Failed to delete resume.');
      return false;
    }
  }, []);

  const downloadResume = useCallback(async (id: string, filename: string): Promise<boolean> => {
    try {
      await resumeService.download(id, filename);
      return true;
    } catch {
      toast.error('Failed to download resume.');
      return false;
    }
  }, []);

  return {
    resumes,
    loading,
    uploading,
    uploadProgress,
    fetchResumes,
    uploadResume,
    setActive,
    deleteResume,
    downloadResume
  };
}
