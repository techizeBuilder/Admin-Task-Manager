import React, { useState, useEffect } from "react";
import useTasksStore from "../../stores/tasksStore";

const AllTasks = () => {
  const { tasks } = useTasksStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">All Tasks</h1>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-gray-600">{task.status} - {task.priority}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllTasks;