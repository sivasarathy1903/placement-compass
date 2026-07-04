import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CloudArrowUpIcon,
  DocumentIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { useResumes } from './useResumes';

const ResumeManager: React.FC = () => {
  const {
    resumes,
    loading,
    uploading,
    uploadProgress,
    fetchResumes,
    uploadResume,
    setActive,
    deleteResume,
    downloadResume,
  } = useResumes();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [label, setLabel] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // ── Drag and Drop handlers ──
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type (pdf, doc, docx)
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!validTypes.includes(file.type)) {
      alert('Only PDF and Word documents are allowed.');
      return;
    }
    // Validate size (10MB limit is enforced by backend, but good to check here too)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10 MB limit.');
      return;
    }
    setSelectedFile(file);
    // Auto-fill label with filename if empty
    if (!label) {
      setLabel(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const success = await uploadResume({ file: selectedFile, label });
    if (success) {
      setSelectedFile(null);
      setLabel('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const cancelSelection = () => {
    setSelectedFile(null);
    setLabel('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      deleteResume(id);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Resume Manager</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Upload, manage, and select your active resumes.
        </p>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Upload Zone */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">Upload New Version</h2>
              
              {!selectedFile ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-zinc-300 dark:border-zinc-700 hover:border-brand-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleChange}
                  />
                  <CloudArrowUpIcon className="w-10 h-10 mx-auto text-zinc-400 mb-3" />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Click or drag file here
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">PDF or DOCX (max 10MB)</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <DocumentIcon className="w-8 h-8 text-brand-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-zinc-500">{formatSize(selectedFile.size)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                      Version Label (Optional)
                    </label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g. SDE Intern - 2025"
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  {uploading ? (
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-brand-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-zinc-500">Uploading {uploadProgress}%...</p>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={cancelSelection}
                        className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition shadow-sm shadow-brand-500/20"
                      >
                        Upload
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Version History */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Version History</h2>
              <span className="text-sm text-zinc-500">{resumes.length} total</span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 border-dashed">
                <DocumentDuplicateIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white">No resumes uploaded</h3>
                <p className="text-xs text-zinc-500 mt-1">Upload your first resume version on the left.</p>
              </div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } }
                }}
              >
                <AnimatePresence>
                  {resumes.map((resume) => (
                    <motion.div
                      key={resume.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`relative flex items-center p-5 rounded-xl border bg-white dark:bg-zinc-900 shadow-sm transition-all ${
                        resume.isActive 
                          ? 'border-brand-500 ring-1 ring-brand-500' 
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex-1 flex items-start gap-4 min-w-0">
                        <div className={`p-3 rounded-lg shrink-0 ${resume.isActive ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                          <DocumentTextIcon className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                              {resume.label}
                            </h3>
                            {resume.isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300">
                                <CheckCircleIcon className="w-3 h-3" />
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 truncate mb-1" title={resume.originalFilename}>
                            {resume.originalFilename}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                            <span>{formatDate(resume.createdAt)}</span>
                            <span>•</span>
                            <span>{formatSize(resume.sizeBytes)}</span>
                            <span>•</span>
                            <span>{resume.contentType.includes('pdf') ? 'PDF' : 'Word'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-4">
                        <button
                          onClick={() => downloadResume(resume.id, resume.originalFilename)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition"
                          title="Download"
                        >
                          <ArrowDownTrayIcon className="w-5 h-5" />
                        </button>
                        
                        {!resume.isActive && (
                          <button
                            onClick={() => setActive(resume.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-brand-600 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 transition"
                          >
                            Set Active
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(resume.id)}
                          className={`p-2 rounded-lg transition ${resume.isActive ? 'text-zinc-300 dark:text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20'}`}
                          disabled={resume.isActive}
                          title={resume.isActive ? "Cannot delete active resume" : "Delete"}
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ResumeManager;
