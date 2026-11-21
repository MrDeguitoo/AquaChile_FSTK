import { useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Trash2, Eye } from 'lucide-react';

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Enhanced File Upload Component with Google Drive integration
 * Supports drag & drop, preview, and Drive upload
 */
export default function DriveFileUpload({
  onUpload,
  onDelete,
  value = null,
  label = 'Adjuntar archivo',
  accept = '.pdf,.doc,.docx',
  multiple = false,
  uploadToDrive = true,
  folderId,
  className = '',
  disabled = false,
}) {
  const [file, setFile] = useState(value);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [driveFile, setDriveFile] = useState(null);

  const validateFile = useCallback((file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato no permitido. Solo se aceptan archivos PDF, DOC y DOCX';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Archivo demasiado grande. Máximo 5 MB';
    }
    return null;
  }, []);

  const uploadFile = useCallback(async (fileToUpload) => {
    setUploading(true);
    setError('');

    try {
      const result = await onUpload(fileToUpload, folderId);
      if (result.success && result.file) {
        setDriveFile(result.file);
      } else {
        setError(result.error || 'Error al subir archivo a Drive');
      }
    } catch (err) {
      setError(err.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  }, [onUpload, folderId]);

  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setFile(selectedFile);

    // If uploadToDrive is enabled, upload immediately
    if (uploadToDrive && onUpload) {
      uploadFile(selectedFile);
    }
  }, [validateFile, uploadToDrive, onUpload, uploadFile]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    setFile(null);
    setDriveFile(null);
    setError('');
    setFileInputKey(k => k + 1);
    if (onDelete) onDelete();
  }, [onDelete]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label htmlFor={`file-upload-${fileInputKey}`} className="block text-xs font-semibold text-gray-600 uppercase mb-1">{label}</label>

      {/* Drop zone / File input */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input
          type="file"
          id={`file-upload-${fileInputKey}`}
          key={fileInputKey}
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          multiple={multiple}
        />

        <div className="text-center">
          <div className="text-5xl mb-3">{dragActive ? '📥' : getFileIcon(file?.type || '')}</div>
          <p className="text-gray-600 mb-1">
            {dragActive
              ? 'Suelta el archivo aquí'
              : file
                ? file.name
                : 'Arrastra y suelta un archivo, o haz clic para seleccionar'}
          </p>
          <p className="text-xs text-gray-400">
            {file ? formatFileSize(file.size) : 'Formatos: PDF, DOC, DOCX (máx. 5 MB)'}
          </p>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl z-10">
            <div className="text-center">
              <svg className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Subiendo a Google Drive...</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File preview */}
      {file && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{getFileIcon(file.type)}</div>
            <div>
              <p className="font-medium text-gray-800 truncate max-w-md">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.type}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {driveFile && (
              <>
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>Subido a Drive</span>
                </div>
                {driveFile.webViewLink && (
                  <a
                    href={driveFile.webViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Ver en Google Drive"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                )}
              </>
            )}

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar archivo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Drive file info (if already uploaded) */}
      {driveFile && !file && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Archivo en Google Drive</p>
              <p className="text-xs text-gray-500">{driveFile.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {driveFile.webViewLink && (
              <a
                href={driveFile.webViewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Ver en Drive</span>
              </a>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}