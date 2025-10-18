import React from 'react';
import { useSubtask } from '../../contexts/SubtaskContext';
import SubtaskForm from './SubtaskForm';

const GlobalSubtaskDrawer = () => {
  const { isSubtaskDrawerOpen, parentTask, editData, mode, closeSubtaskDrawer, onUpdateSubtask } = useSubtask();

  console.log('🔍 GlobalSubtaskDrawer render:', {
    isSubtaskDrawerOpen,
    hasParentTask: !!parentTask,
    parentTaskType: typeof parentTask,
    parentTaskId: parentTask?.id,
    parentTask_id: parentTask?._id,
    parentTaskDocId: parentTask?._doc?._id,
    mode,
    editData,
    hasUpdateHandler: !!onUpdateSubtask
  });

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
      onUpdateSubmit={onUpdateSubtask}
    />
  );
};

export default GlobalSubtaskDrawer;