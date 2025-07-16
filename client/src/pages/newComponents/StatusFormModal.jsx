
import React, { useState } from 'react'

function StatusFormModal({ status, onSubmit, onClose, existingStatuses, systemStatuses, isEdit = false }) {
  const [formData, setFormData] = useState({
    code: status?.code || '',
    label: status?.label || '',
    color: status?.color || '#667eea',
    systemMapping: status?.systemMapping || '',
    isFinal: status?.isFinal || false,
    allowedTransitions: status?.allowedTransitions || []
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.code.trim()) {
      newErrors.code = 'Status code is required'
    } else if (!/^[A-Z_]+$/.test(formData.code)) {
      newErrors.code = 'Status code must contain only uppercase letters and underscores'
    }
    
    if (!formData.label.trim()) {
      newErrors.label = 'Display label is required'
    }
    
    if (!formData.systemMapping) {
      newErrors.systemMapping = 'System mapping is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      onClose()
    }
  }

  const colorPresets = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe',
    '#43e97b', '#38f9d7', '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
    '#d299c2', '#fef9d7', '#dee5fe', '#b3d8ff'
  ]

  return (
    <div className="status-form-modal-overlay">
      <div className="status-form-modal">
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Status' : 'Create New Status'}
            </h2>
          </div>
          <button 
            className="close-button"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Code & Label Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="code" className="form-label flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Status Code*
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  disabled={isEdit}
                  className={`form-input ${errors.code ? 'border-red-500 ring-red-200' : ''} ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="e.g., IN_PROGRESS"
                />
                {errors.code && <span className="text-red-500 text-sm mt-1 block">{errors.code}</span>}
                <small className="form-hint">
                  {isEdit ? 'Status code cannot be changed after creation' : 'Use UPPERCASE letters and underscores only'}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="label" className="form-label flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Display Label*
                </label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  required
                  className={`form-input ${errors.label ? 'border-red-500 ring-red-200' : ''}`}
                  placeholder="e.g., In Progress"
                />
                {errors.label && <span className="text-red-500 text-sm mt-1 block">{errors.label}</span>}
                <small className="form-hint">
                  User-friendly name shown in the interface
                </small>
              </div>
            </div>

            {/* Color Selection */}
            <div className="form-group">
              <label className="form-label flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 3H5a2 2 0 00-2 2v12a4 4 0 004 4h2a2 2 0 002-2V5a2 2 0 00-2-2z" />
                </svg>
                Status Color
              </label>
              
              <div className="flex flex-col gap-4">
                {/* Color Presets */}
                <div className="grid grid-cols-8 gap-2">
                  {colorPresets.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 ${
                        formData.color === color 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({...formData, color})}
                      title={color}
                    />
                  ))}
                </div>
                
                {/* Custom Color Input */}
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="form-input flex-1"
                    placeholder="#667eea"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center font-bold text-white text-xs shadow-inner"
                    style={{ backgroundColor: formData.color }}
                  >
                    {formData.label ? formData.label.charAt(0).toUpperCase() : 'A'}
                  </div>
                </div>
              </div>
              <small className="form-hint">
                Choose a color that represents this status visually
              </small>
            </div>

            {/* System Mapping & Final Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="systemMapping" className="form-label flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  System Mapping*
                </label>
                <select
                  id="systemMapping"
                  name="systemMapping"
                  value={formData.systemMapping}
                  onChange={handleChange}
                  required
                  className={`form-select ${errors.systemMapping ? 'border-red-500 ring-red-200' : ''}`}
                >
                  <option value="">Select system status...</option>
                  {systemStatuses.map(sysStatus => (
                    <option key={sysStatus.code} value={sysStatus.code}>
                      {sysStatus.label} ({sysStatus.code})
                    </option>
                  ))}
                </select>
                {errors.systemMapping && <span className="text-red-500 text-sm mt-1 block">{errors.systemMapping}</span>}
                <small className="form-hint">
                  Links this status to core system functionality
                </small>
              </div>

              <div className="form-group">
                <label className="form-label flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status Properties
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    name="isFinal"
                    checked={formData.isFinal}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1 !border-none !shadow-none !rounded-none">
                    <span className="font-medium text-gray-900">Final Status</span>
                    <p className="text-sm text-gray-600">No further transitions allowed from this status</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isEdit ? 'Update Status' : 'Create Status'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StatusFormModal
