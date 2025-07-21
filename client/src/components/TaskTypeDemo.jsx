import React, { useState } from 'react';
import { taskTypeApi } from '../api/taskTypeApi';

const TaskTypeDemo = () => {
  const [selectedType, setSelectedType] = useState('simple');
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    status: 'todo'
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleInputChange = (field, value) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const result = await taskTypeApi.createTask(selectedType, taskData);
      setResponse({
        success: true,
        data: result
      });
    } catch (error) {
      setResponse({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (selectedType) {
      case 'milestone':
        return (
          <>
            <div className="form-group">
              <label>Milestone Type:</label>
              <select 
                value={taskData.milestoneType || 'standalone'}
                onChange={(e) => handleInputChange('milestoneType', e.target.value)}
                className="form-control"
              >
                <option value="standalone">Standalone</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div className="form-group">
              <label>Completion Criteria:</label>
              <textarea
                value={taskData.completionCriteria || ''}
                onChange={(e) => handleInputChange('completionCriteria', e.target.value.split(','))}
                placeholder="Enter criteria separated by commas"
                className="form-control"
              />
            </div>
          </>
        );

      case 'recurring':
        return (
          <>
            <div className="form-group">
              <label>Frequency:</label>
              <select 
                value={taskData.frequency || 'daily'}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="form-control"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Interval:</label>
              <input
                type="number"
                value={taskData.interval || 1}
                onChange={(e) => handleInputChange('interval', parseInt(e.target.value))}
                min="1"
                className="form-control"
              />
            </div>
          </>
        );

      case 'approval':
        return (
          <>
            <div className="form-group">
              <label>Approval Mode:</label>
              <select 
                value={taskData.approvalMode || 'any'}
                onChange={(e) => handleInputChange('approvalMode', e.target.value)}
                className="form-control"
              >
                <option value="any">Any Approver</option>
                <option value="all">All Approvers</option>
                <option value="majority">Majority</option>
              </select>
            </div>
            <div className="form-group">
              <label>Auto Approve After (hours):</label>
              <input
                type="number"
                value={taskData.autoApproveAfter || ''}
                onChange={(e) => handleInputChange('autoApproveAfter', e.target.value)}
                placeholder="Hours"
                className="form-control"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="task-type-demo" style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2>Task Type API Demo</h2>
      
      <div className="type-selector" style={{ marginBottom: '20px' }}>
        <h3>Select Task Type:</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['simple', 'milestone', 'recurring', 'approval'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '8px 16px',
                backgroundColor: selectedType === type ? '#007bff' : '#f8f9fa',
                color: selectedType === type ? 'white' : 'black',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div className="form-group">
          <label>Title: *</label>
          <input
            type="text"
            value={taskData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
            className="form-control"
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            value={taskData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-control"
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
          />
        </div>

        <div className="form-group">
          <label>Priority:</label>
          <select 
            value={taskData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="form-control"
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label>Category:</label>
          <select 
            value={taskData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="form-control"
            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value="">Select category...</option>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
            <option value="research">Research</option>
            <option value="support">Support</option>
          </select>
        </div>

        {selectedType === 'simple' && (
          <>
            <div className="form-group">
              <label>Reference Process:</label>
              <input
                type="text"
                value={taskData.referenceProcess || ''}
                onChange={(e) => handleInputChange('referenceProcess', e.target.value)}
                placeholder="e.g., SOP-001"
                className="form-control"
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div className="form-group">
              <label>Custom Form:</label>
              <input
                type="text"
                value={taskData.customForm || ''}
                onChange={(e) => handleInputChange('customForm', e.target.value)}
                placeholder="e.g., FORM-001"
                className="form-control"
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div className="form-group">
              <label>Dependencies (comma-separated):</label>
              <input
                type="text"
                value={taskData.dependencies ? taskData.dependencies.join(', ') : ''}
                onChange={(e) => handleInputChange('dependencies', e.target.value.split(',').map(d => d.trim()).filter(d => d))}
                placeholder="task-001, task-002"
                className="form-control"
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </>
        )}

        {renderTypeSpecificFields()}

        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Creating...' : `Create ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Task`}
        </button>
      </form>

      {response && (
        <div 
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: response.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${response.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px'
          }}
        >
          <h4>{response.success ? 'Success!' : 'Error'}</h4>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TaskTypeDemo;