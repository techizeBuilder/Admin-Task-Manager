import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  UserMinus, 
  ArrowRight, 
  MessageSquare,
  Tag,
  Calendar,
  Flag
} from "lucide-react";

const getActionIcon = (action) => {
  switch (action) {
    case 'created':
      return <Plus className="h-4 w-4 text-green-600" />;
    case 'updated':
      return <Edit className="h-4 w-4 text-blue-600" />;
    case 'deleted':
      return <Trash2 className="h-4 w-4 text-red-600" />;
    case 'assigned':
      return <UserPlus className="h-4 w-4 text-purple-600" />;
    case 'unassigned':
      return <UserMinus className="h-4 w-4 text-blue-600" />;
    case 'status_changed':
      return <ArrowRight className="h-4 w-4 text-indigo-600" />;
    case 'commented':
      return <MessageSquare className="h-4 w-4 text-gray-600" />;
    case 'tagged':
      return <Tag className="h-4 w-4 text-pink-600" />;
    case 'due_date_changed':
      return <Calendar className="h-4 w-4 text-blue-600" />;
    case 'priority_changed':
      return <Flag className="h-4 w-4 text-red-500" />;
    default:
      return <Edit className="h-4 w-4 text-gray-600" />;
  }
};

const getActionColor = (action) => {
  switch (action) {
    case 'created':
      return 'bg-green-50 border-green-200 dark:bg-green-900/20';
    case 'updated':
      return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20';
    case 'deleted':
      return 'bg-red-50 border-red-200 dark:bg-red-900/20';
    case 'assigned':
      return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20';
    case 'unassigned':
      return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20';
    case 'status_changed':
      return 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20';
    case 'commented':
      return 'bg-gray-50 border-gray-200 dark:bg-gray-800/20';
    case 'tagged':
      return 'bg-pink-50 border-pink-200 dark:bg-pink-900/20';
    case 'due_date_changed':
      return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20';
    case 'priority_changed':
      return 'bg-red-50 border-red-200 dark:bg-red-900/20';
    default:
      return 'bg-gray-50 border-gray-200 dark:bg-gray-800/20';
  }
};

const formatActionDescription = (auditLog) => {
  const { action, details, oldValue, newValue } = auditLog;
  
  switch (action) {
    case 'created':
      return 'created this task';
    case 'updated':
      return `updated ${details || 'the task'}`;
    case 'deleted':
      return 'deleted this task';
    case 'assigned':
      return `assigned this task to ${newValue}`;
    case 'unassigned':
      return `unassigned ${oldValue} from this task`;
    case 'status_changed':
      return `changed status from ${oldValue} to ${newValue}`;
    case 'commented':
      return 'added a comment';
    case 'tagged':
      return `added tag: ${newValue}`;
    case 'due_date_changed':
      return `changed due date from ${oldValue || 'none'} to ${newValue || 'none'}`;
    case 'priority_changed':
      return `changed priority from ${oldValue} to ${newValue}`;
    default:
      return details || 'performed an action';
  }
};

export function TaskAuditTrail({ auditLogs = [] }) {
  if (auditLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Activity Timeline
      </h3>
      
      <div className="space-y-3">
        {auditLogs.map((log, index) => (
          <Card key={log.id || index} className={`p-4 ${getActionColor(log.action)}`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getActionIcon(log.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={log.user?.avatar} />
                    <AvatarFallback className="text-xs">
                      {log.user?.firstName?.[0]}{log.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {log.user?.firstName} {log.user?.lastName}
                  </span>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {formatActionDescription(log)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                  </span>
                  
                  {log.metadata && (
                    <div className="flex gap-1">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {log.details && log.action !== 'commented' && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {log.details}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}