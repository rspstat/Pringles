import React, { useState } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import './FileUpload.css';

export default function FileUpload({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:8000/api/upload/', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (response.ok) {
          results.push({ 
            filename: file.name, 
            status: 'success', 
            data: data.data 
          });
        } else {
          results.push({ 
            filename: file.name, 
            status: 'error', 
            error: data.detail 
          });
        }
      } catch (error) {
        results.push({ 
          filename: file.name, 
          status: 'error', 
          error: '업로드 실패' 
        });
      }
    }

    setUploadResults(results);
    setUploading(false);
    setFiles([]);

    if (onUploadComplete) {
      onUploadComplete(results);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="file-upload-container">
      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="upload-icon" size={48} />
        <h3>파일을 드래그하거나 클릭하여 업로드</h3>
        <p>회로 파일 (.sch, .brd, .pdf, .png, .jpg, .svg)</p>
        
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="file-input"
          accept=".sch,.brd,.pdf,.png,.jpg,.jpeg,.svg"
        />
      </div>

      {/* 선택된 파일 목록 */}
      {files.length > 0 && (
        <div className="file-list">
          <h4>선택된 파일 ({files.length})</h4>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <File size={20} />
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="remove-button"
              >
                <X size={18} />
              </button>
            </div>
          ))}
          
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="upload-button"
          >
            {uploading ? '업로드 중...' : '업로드 시작'}
          </button>
        </div>
      )}

      {/* 업로드 결과 */}
      {uploadResults.length > 0 && (
        <div className="upload-results">
          <h4>업로드 결과</h4>
          {uploadResults.map((result, index) => (
            <div
              key={index}
              className={`result-item ${result.status}`}
            >
              {result.status === 'success' ? (
                <CheckCircle size={20} className="success-icon" />
              ) : (
                <AlertCircle size={20} className="error-icon" />
              )}
              <div className="result-info">
                <span className="result-filename">{result.filename}</span>
                {result.status === 'error' && (
                  <span className="result-error">{result.error}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}