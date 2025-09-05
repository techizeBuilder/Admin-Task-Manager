import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  MoreVertical,
  Plus,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import DataTable from '../../components/ui/DataTable';
import '../../components/ui/DataTable.css';
import './EnhancedAllTasks.css';

const EnhancedAllTasks = () => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  // Sample task data
  const tasks = [
    {
      id: 1,
      title: "Update user authentication system",
      assignee: "Joe",
      assigneeEmail: "joe@company.com",
      status: "In Progress",
      priority: "High",
      dueDate: "2024-01-25",
      progress: 60,
      tags: ["security", "authentication", "backend"],
      taskType: "Simple Task",
      colorCode: "#3b82f6"
    },
    {
      id: 2,
      title: "Design new landing page",
      assignee: "Jane Smith", 
      assigneeEmail: "jane@company.com",
      status: "Open",
      priority: "Medium",
      dueDate: "2024-01-30",
      progress: 0,
      tags: ["design", "ui", "frontend"],
      taskType: "Simple Task",
      colorCode: "#10b981"
    },
    {
      id: 3,
      title: "Fix mobile responsiveness issues",
      assignee: "John Johnson",
      assigneeEmail: "john@company.com", 
      status: "Completed",
      priority: "Low",
      dueDate: "2024-01-20",
      progress: 100,
      tags: ["bug", "mobile", "responsive"],
      taskType: "Simple Task", 
      colorCode: "#8b5cf6"
    },
    {
      id: 4,
      title: "Conduct user research interviews",
      assignee: "John Wilson",
      assigneeEmail: "wilson@company.com",
      status: "In Progress", 
      priority: "High",
      dueDate: "2024-01-28",
      progress: 80,
      tags: ["research", "ux"],
      taskType: "Simple Task",
      colorCode: "#8b5cf6"
    }
  ];

  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: 'Task',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-1 h-12 rounded-full"
            style={{ backgroundColor: row.original.colorCode }}
          />
          <div>
            <div className="font-medium text-gray-900">{row.getValue('title')}</div>
            <div className="text-sm text-gray-500">ID: #{row.original.id}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'assignee',
      header: 'Assignee',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="avatar">
            {row.original.assignee.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.getValue('assignee')}</div>
            <div className="text-sm text-gray-500">{row.original.assigneeEmail}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status');
        const statusClass = status === 'Completed' ? 'completed' : 
                           status === 'In Progress' ? 'in-progress' :
                           status === 'Open' ? 'pending' : 'overdue';
        return (
          <span className={`status-badge ${statusClass}`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority').toLowerCase();
        return (
          <span className={`priority-badge ${priority}`}>
            {row.getValue('priority')}
          </span>
        );
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <span className="text-sm text-gray-900">{row.getValue('dueDate')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="progress-bar" style={{ width: '60px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${row.getValue('progress')}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">{row.getValue('progress')}%</span>
        </div>
      ),
    },
    {
      accessorKey: 'tags',
      header: 'Tags',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags?.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'taskType',
      header: 'Task Type',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{row.getValue('taskType')}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => console.log('View task:', row.original.id)}
          >
            View
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={16} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ], []);

  const handleRowSelect = (task) => {
    console.log('Selected task:', task);
  };

  return (
    <div className="enhanced-all-tasks">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">All Tasks</h1>
          <p className="page-subtitle">Manage and track all your tasks</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <Filter size={16} />
            Filters
          </button>
          <button className="btn-secondary">
            <Calendar size={16} />
            Calendar View
          </button>
          <button className="btn-primary">
            <Plus size={16} />
            Create Task
          </button>
        </div>
      </div>

      <div className="bulk-actions">
        <div className="bulk-actions-left">
          <span className="bulk-count">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        <div className="bulk-actions-right">
          <button className="btn-secondary">
            <Download size={16} />
            Export as CSV
          </button>
          <button className="btn-secondary">
            <Download size={16} />
            Export as Excel
          </button>
        </div>
      </div>

      <DataTable
        data={tasks}
        columns={columns}
        onRowSelect={handleRowSelect}
        enableSelection={true}
        enablePagination={true}
        pageSize={10}
      />
    </div>
  );
};

export default EnhancedAllTasks;