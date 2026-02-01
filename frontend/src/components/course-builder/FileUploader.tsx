import { useState, useRef } from 'react';
import { Upload, X, File, FileText, Video, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  lessonId: number;
  onUploadComplete?: (file: any) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  id: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  lessonId,
  onUploadComplete,
  acceptedTypes = '*',
  maxSizeMB = 100,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getContentType = (file: File): string => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf')) return 'pdf';
    if (file.type.includes('presentation') || file.name.endsWith('.pptx')) return 'slides';
    return 'file';
  };

  const uploadFile = async (file: File) => {
    const fileId = Math.random().toString(36).substring(7);
    
    // Add to uploading files
    setUploadingFiles(prev => [...prev, {
      file,
      progress: 0,
      status: 'uploading',
      id: fileId,
    }]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('content_type', getContentType(file));
      formData.append('title', file.name);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadingFiles(prev =>
            prev.map(f => f.id === fileId ? { ...f, progress } : f)
          );
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setUploadingFiles(prev =>
            prev.map(f => f.id === fileId ? { ...f, status: 'success', progress: 100 } : f)
          );
          
          // Call callback
          if (onUploadComplete) {
            onUploadComplete(response.content);
          }

          // Remove after 2 seconds
          setTimeout(() => {
            setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
          }, 2000);
        } else {
          throw new Error('Upload failed');
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        setUploadingFiles(prev =>
          prev.map(f => f.id === fileId ? { ...f, status: 'error', progress: 0 } : f)
        );
      });

      // Send request
      const token = localStorage.getItem('access_token');
      xhr.open('POST', `/api/v1/academy/lessons/${lessonId}/content/upload/`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadingFiles(prev =>
        prev.map(f => f.id === fileId ? { ...f, status: 'error', progress: 0 } : f)
      );
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size: ${maxSizeMB}MB`);
        return;
      }

      uploadFile(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={cn(
          'border-2 border-dashed p-8 transition-colors cursor-pointer',
          isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-1">
            Sleep bestanden hierheen of klik om te uploaden
          </p>
          <p className="text-sm text-muted-foreground">
            Ondersteund: Video, PDF, Afbeeldingen, Presentaties (max {maxSizeMB}MB)
          </p>
        </div>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {file.status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin text-purple-500" />}
                  {file.status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {file.status === 'error' && getFileIcon(file.file.type)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </p>

                  {/* Progress Bar */}
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-2 h-1" />
                  )}

                  {/* Status Messages */}
                  {file.status === 'success' && (
                    <p className="text-xs text-green-600 mt-1">✓ Upload succesvol</p>
                  )}
                  {file.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">✗ Upload mislukt</p>
                  )}
                </div>

                {/* Remove Button */}
                {file.status !== 'uploading' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
