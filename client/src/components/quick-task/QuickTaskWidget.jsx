import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const QuickTaskWidget = () => {
  const [quickTaskInput, setQuickTaskInput] = useState('');

  const handleQuickTaskSubmit = () => {
    const trimmedTitle = quickTaskInput.trim();
    if (trimmedTitle) {
      // TODO: Replace console.log with an API call to save the task
      console.log('New Quick Task Created:', trimmedTitle);

      // Clear the input field after submission
      setQuickTaskInput('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleQuickTaskSubmit();
    }
  };

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border sticky top-6"
      data-testid="card-quick-task"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Quick Add Task
      </h2>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="What needs to be done?"
          value={quickTaskInput}
          onChange={(e) => setQuickTaskInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          data-testid="input-quick-task"
        />
        <button
          onClick={handleQuickTaskSubmit}
          disabled={!quickTaskInput.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
          data-testid="button-add-quick-task"
        >
          <Plus size={16} className="inline mr-2" />
          Add Quick Task
        </button>
      </div>
    </div>
  );
};

export default QuickTaskWidget;