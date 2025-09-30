import React from 'react';
import { useSubtask } from '../../contexts/SubtaskContext';
import SubtaskForm from './SubtaskForm';

const GlobalSubtaskDrawer = () => {
  const { isSubtaskDrawerOpen, parentTask, editData, mode, closeSubtaskDrawer } = useSubtask();

  if (!isSubtaskDrawerOpen || !parentTask) {
    return null;
  }

  return (
    <SubtaskForm
      isOpen={isSubtaskDrawerOpen}
      onClose={closeSubtaskDrawer}
      parentTask={parentTask}
      editData={editData}
      mode={mode}
    />
  );
};

export default GlobalSubtaskDrawer;