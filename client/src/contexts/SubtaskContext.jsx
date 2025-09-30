import React, { createContext, useContext, useState } from 'react';

const SubtaskContext = createContext();

export const useSubtask = () => {
  const context = useContext(SubtaskContext);
  if (!context) {
    throw new Error('useSubtask must be used within a SubtaskProvider');
  }
  return context;
};

export const SubtaskProvider = ({ children }) => {
  const [isSubtaskDrawerOpen, setIsSubtaskDrawerOpen] = useState(false);
  const [parentTask, setParentTask] = useState(null);
  const [editData, setEditData] = useState(null);
  const [mode, setMode] = useState('create'); // 'create' or 'edit'

  const openSubtaskDrawer = (task, editSubtask = null) => {
    console.log('🚀 SubtaskContext: Opening subtask drawer with task:', {
      task,
      taskType: typeof task,
      taskId: task?.id,
      task_id: task?._id,
      editSubtask
    });

    setParentTask(task);
    setEditData(editSubtask);
    setMode(editSubtask ? 'edit' : 'create');
    setIsSubtaskDrawerOpen(true);
  };

  const closeSubtaskDrawer = () => {
    setIsSubtaskDrawerOpen(false);
    setParentTask(null);
    setEditData(null);
    setMode('create');
  };

  const handleSubtaskSubmit = (subtaskData) => {
    // This will be handled by individual components
    console.log('Subtask submitted:', subtaskData);
    closeSubtaskDrawer();
  };

  return (
    <SubtaskContext.Provider
      value={{
        isSubtaskDrawerOpen,
        parentTask,
        editData,
        mode,
        openSubtaskDrawer,
        closeSubtaskDrawer,
        handleSubtaskSubmit,
      }}
    >
      {children}
    </SubtaskContext.Provider>
  );
};