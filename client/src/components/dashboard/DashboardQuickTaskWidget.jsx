import React from 'react';
import QuickTaskWidget from '@/components/tasks/QuickTaskWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, TrendingUp, CheckCircle } from 'lucide-react';

// Dashboard Quick Task Widget - Compact version for dashboard
export default function DashboardQuickTaskWidget() {
  // Mock stats
  const taskStats = {
    open: 3,
    completed: 8,
    converted: 2
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-bold text-blue-600">{taskStats.open}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Done</p>
              <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Converted</p>
              <p className="text-2xl font-bold text-purple-600">{taskStats.converted}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Quick Task Widget */}
      <QuickTaskWidget />
    </div>
  );
}