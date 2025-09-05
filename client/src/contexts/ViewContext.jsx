import React, { createContext, useContext, useState } from 'react';

const ViewContext = createContext();

export const useView = () => {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};

export const ViewProvider = ({ children }) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState(null);

  const openViewModal = (task) => {
    setViewTask(task);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewTask(null);
  };

  return (
    <ViewContext.Provider
      value={{
        isViewModalOpen,
        viewTask,
        openViewModal,
        closeViewModal,
      }}
    >
      {children}
    </ViewContext.Provider>
  );
};