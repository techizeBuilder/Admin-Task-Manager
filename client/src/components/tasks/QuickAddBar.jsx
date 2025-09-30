import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

// Quick Add Bar Component - for global access
export default function QuickAddBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quickText, setQuickText] = useState('');

  const handleQuickAdd = () => {
    if (!quickText.trim()) return;
    
    // Create quick task instantly
    const quickTask = {
      title: quickText.trim(),
      priority: 'low',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 days
      status: 'open'
    };
    
    // Mock save - in real app would call API
    console.log('Quick task created:', quickTask);
    
    setQuickText('');
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-sm">Quick Task</span>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="What needs to be done?"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
              className="text-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleQuickAdd}>
              Add
            </Button>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-xs text-gray-500 mt-2 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 rounded-full h-12 w-12 shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}