import React, { useState } from 'react';

function RiskModal({ task, onSubmit, onClose }) {
  const [riskData, setRiskData] = useState({
    note: task.riskNote || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(riskData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Mark Task as At Risk: {task?.title}</h3>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-group">
            <label>Risk Note:</label>
            <textarea
              value={riskData.note}
              onChange={(e) =>
                setRiskData({ ...riskData, note: e.target.value })
              }
              placeholder="Describe the risks associated with this task"
              className="form-input"
              rows="4"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Mark as At Risk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RiskModal;