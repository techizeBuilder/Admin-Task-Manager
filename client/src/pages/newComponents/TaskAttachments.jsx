
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { FileText, BarChart3, Database, Image, Folder, Cloud, Download, Trash2, ExternalLink, Plus, Link as LinkIcon } from 'lucide-react'
import SimpleFileUploader from '../../components/common/SimpleFileUploader'
import '../../components/common/AttachmentUploader.css'

export default function TaskAttachments({ taskId }) {
  const [files, setFiles] = useState([])
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showAddFile, setShowAddFile] = useState(false)
  const [showAddLink, setShowAddLink] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [newLink, setNewLink] = useState({ title: '', url: '', description: '' })
  const fileInputRef = useRef(null)

  // API Functions
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const getAuthHeadersForFile = () => {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  // Load files and links from backend
  const loadTaskFiles = useCallback(async () => {
    if (!taskId) return
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/files`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setFiles(result.data.map(file => ({
            ...file,
            id: file._id,
            name: file.originalName,
            size: formatFileSize(file.size),
            type: file.originalName.split('.').pop().toLowerCase(),
            uploadedBy: file.uploadedBy?.name || 'Unknown',
            uploadedAt: new Date(file.uploadedAt).toLocaleDateString() + ' at ' + new Date(file.uploadedAt).toLocaleTimeString(),
            icon: getFileIcon(file.originalName)
          })))
        }
      } else {
        console.error('Failed to load files:', response.status)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }, [taskId])

  const loadTaskLinks = useCallback(async () => {
    if (!taskId) return
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/links`, {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('🔗 Links API result:', result)
        if (result.success && result.data) {
          const processedLinks = result.data.map(link => ({
            ...link,
            id: link._id,
            addedBy: link.addedBy?.name || 'Unknown',
            addedAt: new Date(link.createdAt).toLocaleDateString() + ' at ' + new Date(link.createdAt).toLocaleTimeString(),
            favicon: '🔗'
          }))
          console.log('🔗 Processed links:', processedLinks)
          setLinks(processedLinks)
        }
      } else {
        console.error('Failed to load links:', response.status)
      }
    } catch (error) {
      console.error('Error loading links:', error)
    }
  }, [taskId])

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([loadTaskFiles(), loadTaskLinks()])
      setLoading(false)
    }
    
    if (taskId) {
      loadData()
    }
  }, [taskId, loadTaskFiles, loadTaskLinks])

  // Define utility functions first
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }, [])

  const getFileIcon = useCallback((filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    const icons = {
      pdf: <FileText size={16} className="text-red-500" />,
      doc: '📝',
      docx: '📝',
      xls: <BarChart3 size={16} className="text-green-500" />,
      xlsx: <BarChart3 size={16} className="text-green-500" />,
      ppt: '📊',
      pptx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
      sql: '🗄️',
      txt: '📄'
    }
    return icons[ext] || '📄'
  }, [])

  // File handling functions
  const uploadFileToServer = useCallback(async (file) => {
    if (!taskId) return null
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/files`, {
        method: 'POST',
        headers: getAuthHeadersForFile(),
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          return result.data
        }
      }
      throw new Error('Upload failed')
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }, [taskId])

  const handleFiles = useCallback(async (fileList) => {
    if (uploading) return
    
    setUploading(true)
    const uploadPromises = Array.from(fileList).map(async (file) => {
      try {
        await uploadFileToServer(file)
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
      }
    })
    
    await Promise.all(uploadPromises)
    await loadTaskFiles() // Reload files from server
    setUploading(false)
  }, [uploadFileToServer, loadTaskFiles, uploading])

  const handleDeleteFile = useCallback(async (fileId) => {
    if (!taskId) return
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/files/${fileId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        await loadTaskFiles() // Reload files from server
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }, [taskId, loadTaskFiles])

  const handleDownloadFile = useCallback((file) => {
    // Use the backend download API instead of direct file URLs
    const downloadUrl = `/api/tasks/${taskId}/files/${file.id}/download`
    
    // Add authorization header by creating a fetch request
    const token = localStorage.getItem('token')
    
    if (token) {
      // For authenticated downloads, we need to use fetch and create a blob
      fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (response.ok) {
          return response.blob()
        }
        throw new Error('Download failed')
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = file.name || file.originalName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      })
      .catch(error => {
        console.error('Download failed:', error)
      })
    } else {
      console.error('No token available for download')
    }
  }, [taskId])

  const handleAddLink = useCallback(async () => {
    if (newLink.title && newLink.url && taskId) {
      try {
        console.log('🔗 Adding link:', newLink)
        const response = await fetch(`/api/tasks/${taskId}/links`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            url: newLink.url,
            title: newLink.title,
            description: newLink.description
          })
        })
        
        console.log('🔗 Add link response status:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('🔗 Add link result:', result)
          await loadTaskLinks() // Reload links from server
          setNewLink({ title: '', url: '', description: '' })
          setShowAddLink(false)
        } else {
          const errorText = await response.text()
          console.error('🔗 Add link error:', response.status, errorText)
        }
      } catch (error) {
        console.error('Error adding link:', error)
      }
    } else {
      console.log('🔗 Add link validation failed:', { 
        hasTitle: !!newLink.title, 
        hasUrl: !!newLink.url, 
        hasTaskId: !!taskId 
      })
    }
  }, [newLink, taskId, loadTaskLinks])

  const handleDeleteLink = useCallback(async (linkId) => {
    if (!taskId) return
    
    try {
      const response = await fetch(`/api/tasks/${taskId}/links/${linkId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        await loadTaskLinks() // Reload links from server
      }
    } catch (error) {
      console.error('Error deleting link:', error)
    }
  }, [taskId, loadTaskLinks])

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  // Memoized file list to prevent unnecessary re-renders
  const memoizedFiles = useMemo(() => files, [files])
  const memoizedLinks = useMemo(() => {
    console.log('🔗 Memoizing links:', links)
    return links
  }, [links])

  return (
    <div className="space-y-8">
      {/* Files Section */}
      <div className="files-section">
        <div className="section-header flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📁</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Files ({memoizedFiles.length})</h2>
              <p className="text-sm text-gray-600">Attachments and documents</p>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <SimpleFileUploader
            files={memoizedFiles}
            onFilesChange={setFiles}
            maxSize={5 * 1024 * 1024}
            maxFiles={20}
            className="w-full"
          />
        </div>

        {/* Files List */}
        {files.length > 0 ? (
          <div className="files-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {files.map(file => (
              <div key={file.id} className="file-card bg-white rounded-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="file-icon w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-xl">
                    {file.icon}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center text-blue-600 transition-colors"
                      title="Download"
                    >
                      <span className="text-sm">⬇️</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-600 transition-colors"
                      title="Delete"
                    >
                      <span className="text-sm">🗑️</span>
                    </button>
                  </div>
                </div>
                
                <div className="file-info">
                  <h4 className="font-semibold text-gray-900 mb-1 truncate" title={file.name}>
                    {file.name}
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center justify-between">
                      <span>Size:</span>
                      <span className="font-medium">{file.size}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Uploaded by:</span>
                      <span className="font-medium">{file.uploadedBy}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {file.uploadedAt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files attached</h3>
            <p className="text-gray-600">Upload files to get started</p>
          </div>
        )}
      </div>

      {/* Links Section */}
      <div className="links-section">
        <div className="section-header flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🔗</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Links ({memoizedLinks.length})</h2>
              <p className="text-sm text-gray-600">External references and resources</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddLink(true)}
            className="btn btn-primary flex items-center gap-2 px-6 py-3 min-w-[140px] justify-center"
          >
            <LinkIcon size={16} />
            <span>Add Link</span>
          </button>
        </div>

        {/* Add Link Modal */}
        {showAddLink && (
          <div className="add-link-modal bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <LinkIcon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add New Link</h3>
                  <p className="text-sm text-gray-600">Add an external reference or resource</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddLink(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 transition-colors"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <LinkIcon size={14} className="inline mr-1" />
                  Link Title *
                </label>
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="Enter a descriptive title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ExternalLink size={14} className="inline mr-1" />
                  URL *
                </label>
                <input
                  type="url"
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={14} className="inline mr-1" />
                  Description (Optional)
                </label>
                <textarea
                  value={newLink.description}
                  onChange={(e) => setNewLink(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-200 shadow-sm hover:shadow-md"
                  rows={3}
                  placeholder="Brief description of this link and its relevance to the task"
                />
              </div>
              
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={handleAddLink}
                  className="btn btn-primary flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl py-3 font-medium transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={!newLink.title || !newLink.url}
                >
                  <Plus size={16} />
                  Add Link
                </button>
                <button
                  onClick={() => setShowAddLink(false)}
                  className="btn btn-secondary flex-1 border border-gray-300 text-gray-700 rounded-xl py-3 font-medium transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Links List */}
        {memoizedLinks.length > 0 ? (
          <div className="links-list space-y-3">
            {memoizedLinks.map(link => (
              <div key={link.id} className="link-card bg-white rounded-md border border-gray-200 p-6 hover:shadow-ms transition-all duration-300 group">
                <div className="flex items-start gap-4">
                  <div className="link-favicon w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {link.favicon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 transition-colors"
                          >
                            {link.title}
                          </a>
                        </h4>
                        <p className="text-sm text-blue-600 mb-2 truncate">
                          {link.url}
                        </p>
                        {link.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {link.description}
                          </p>
                        )}
                        <div className="text-xs text-gray-500">
                          Added by {link.addedBy} • {link.addedAt}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        <button
                          onClick={() => window.open(link.url, '_blank')}
                          className="w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center text-blue-600 transition-colors"
                          title="Open Link"
                        >
                          <ExternalLink size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔗</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No links added</h3>
            <p className="text-gray-600">Add external references and resources</p>
          </div>
        )}
      </div>
    </div>
  )
}
