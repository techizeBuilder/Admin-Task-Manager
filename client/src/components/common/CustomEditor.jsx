import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import { Paperclip, X, FileText, Image, File } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';
import './CustomEditor.css';

const CustomEditor = ({
  value = '',
  onChange,
  placeholder = 'Start typing...',
  showFileAttachment = true,
  maxFiles = 5,
  acceptedFileTypes = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif',
  className = '',
  height = '200px',
  readOnly = false,
  ...props
}) => {
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const modules = {
    toolbar: readOnly ? false : [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'link'
  ];

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (attachedFiles.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setAttachedFiles(prev => [...prev, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image size={16} className="text-blue-500" />;
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText size={16} className="text-red-500" />;
    } else {
      return <File size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className={`custom-editor ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        readOnly={readOnly}
        style={{ height }}
        {...props}
      />
      
      {showFileAttachment && !readOnly && (
        <div className="attachment-section">
          <div className="attachment-header">
            <button
              type="button"
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={16} />
              <span>Attach Files</span>
            </button>
            <span className="file-count">
              {attachedFiles.length}/{maxFiles} files
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept={acceptedFileTypes}
            style={{ display: 'none' }}
          />

          {attachedFiles.length > 0 && (
            <div className="attached-files">
              {attachedFiles.map((file) => (
                <div key={file.id} className="file-item">
                  <div className="file-info">
                    {getFileIcon(file.type)}
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-file-btn"
                    onClick={() => removeFile(file.id)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomEditor;