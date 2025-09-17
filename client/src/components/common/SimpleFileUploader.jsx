import React, { useState, useRef } from "react";
import { Plus, X, AlertCircle } from "lucide-react";

const SimpleFileUploader = ({
  files = [],
  onFilesChange,
  maxSize = 5 * 1024 * 1024, // 5MB
 
  className = "",
  error = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(error);
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTotalSize = () => {
    return files.reduce((total, file) => total + (file.size || 0), 0);
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    handleDragEvents(e);
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileAdd(droppedFiles);
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFileAdd(selectedFiles);
  };

  const handleFileAdd = (newFiles) => {
    setValidationError(null);
    
    
    
    const validFiles = newFiles.filter(file => {
      if (file.size > maxSize) {
        setValidationError(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}.`);
        return false;
      }
      return true;
    });

    // Check total size after adding
    const totalSize = getTotalSize() + validFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxSize) {
      setValidationError(`Total file size cannot exceed ${formatFileSize(maxSize)}.`);
      return;
    }

    const filesWithIds = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }));

    onFilesChange([...files, ...filesWithIds]);
  };

  const removeFile = (fileId) => {
    const updatedFiles = files.filter((file) => file.id !== fileId);
    onFilesChange(updatedFiles);
    
    // Clear error when removing files
    if (validationError) {
      setValidationError(null);
    }
  };

  // Use external error if provided, otherwise use internal validation error
  const displayError = error || validationError;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${isDragging ? "border-blue-500 bg-blue-50" : 
            displayError ? "border-red-500" :
            "border-gray-300 hover:border-blue-400 hover:bg-gray-50"}
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEvents}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          accept="*/*"
        />

        <div className="flex flex-col items-center gap-2">
          <div className={`w-12 h-12 ${displayError ? 'bg-red-100' : 'bg-blue-100'} rounded-full flex items-center justify-center`}>
            <Plus size={24} className={displayError ? "text-red-600" : "text-blue-600"} />
          </div>
          <div>
            <p className={displayError ? "text-red-600 font-medium" : "text-blue-600 font-medium"}>Click to upload files</p>
            <p className="text-sm text-gray-500 mt-1">
              PDF, DOC, images supported
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {displayError && (
        <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
          <AlertCircle size={16} />
          <span>{displayError}</span>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {file.name.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({formatFileSize(file.size)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(file.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          {/* Total Size */}
          <div className="text-xs text-gray-500 text-right">
            Total size: {formatFileSize(getTotalSize())} /{" "}
            {formatFileSize(maxSize)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleFileUploader;