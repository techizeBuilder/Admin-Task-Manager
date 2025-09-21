import { X } from "lucide-react";
import { ApprovalTaskIcon, MilestoneTaskIcon, RecurringTaskIcon, RegularTaskIcon } from "../common/TaskIcons";

const ConversionModal = ({ onSelectType, onClose }) => {
  const taskTypes = [
    {
      name: "Regular",
      icon: <RegularTaskIcon size={20} />,
      description: "A standard, one-off task.",
    },
    {
      name: "Recurring",
      icon: <RecurringTaskIcon size={20} />,
      description: "A task that repeats on a schedule.",
    },
    {
      name: "Milestone",
      icon: <MilestoneTaskIcon size={20} />,
      description: "A significant goal or deadline.",
    },  
    {
      name: "Approval",
      icon: <ApprovalTaskIcon size={20} />,
      description: "A task that requires sign-off.",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md m-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Convert to Full Task
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Select the type of task you want to create. The new task will be
            pre-filled with details from your quick task.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {taskTypes.map((type) => (
              <button
                key={type.name}
                onClick={() => onSelectType(type.name)}
                className="text-left p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all"
              >
                <div className="flex items-center gap-3 text-blue-600">
                  {type.icon}
                  <span className="font-semibold">{type.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ConversionModal;