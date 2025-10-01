import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Trash2, 
  UserPlus, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Download
} from 'lucide-react';

/**
 * TaskHeader Component - Matches wireframe design exactly
 * Header with action buttons: Add Sub-task, Delete, Reassign, Snooze, Mark Risk, Mark Done, Export
 */
export const TaskHeader = ({
  task,
  onCreateSubtask,
  onDelete,
  onReassign,
  onSnooze,
  onMarkRisk,
  onMarkDone,
  onExport,
  isLoading = false
}) => {
  if (!task) return null;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Header Actions Row - Matching wireframe exactly */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Button 
            size="sm" 
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onCreateSubtask}
            disabled={isLoading}
            data-testid="button-add-subtask"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Sub-task
          </Button>

          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={onDelete}
            disabled={isLoading}
            data-testid="button-delete"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={onReassign}
            disabled={isLoading}
            data-testid="button-reassign"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Reassign
          </Button>

          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={onSnooze}
            disabled={isLoading}
            data-testid="button-snooze"
          >
            <Clock className="h-4 w-4 mr-2" />
            Snooze
          </Button>

          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={onMarkRisk}
            disabled={isLoading}
            data-testid="button-mark-risk"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Mark Risk
          </Button>

          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={onMarkDone}
            disabled={isLoading}
            data-testid="button-mark-done"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark Done
          </Button>

          <Button 
            size="sm" 
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={onExport}
            disabled={isLoading}
            data-testid="button-export"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;