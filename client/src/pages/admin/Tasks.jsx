import { useState } from "react";
// import { TaskTableView } from "@/components/tasks/TaskTableView";
import { TaskKanbanView } from "@/components/tasks/TaskKanbanView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Kanban, Plus } from "lucide-react";
import CalendarDatePicker from "./DatePicker";
import CreateTask from "../../pages/newComponents/CreateTask";
import ApprovalTaskCreator from "../../pages/newComponents/ApprovalTaskCreator";
import AllTasks from "../../components/tasks/TaskTableView";
import { useNavigation } from "react-day-picker";

export default function Tasks() {
  const [activeView, setActiveView] = useState("table");
  const [showSnooze, setShowSnooze] = useState(false);
  const [showTaskTypeDropdown, setShowTaskTypeDropdown] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState("regular");
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showCreateTaskDrawer, setShowCreateTaskDrawer] = useState(false);
  const [showApprovalTaskModal, setShowApprovalTaskModal] = useState(false);
  const [selectedDateForTask, setSelectedDateForTask] = useState(null);

  const handleTaskTypeSelect = (taskType) => {
    setSelectedTaskType(taskType);
    setShowTaskTypeDropdown(false);
    setShowCalendarModal(true);
  };

  const handleCalendarDateSelect = (selectedDate) => {
    setSelectedDateForTask(selectedDate);
    setShowCalendarModal(false);

    if (selectedTaskType === "approval") {
      setShowApprovalTaskModal(true);
    } else {
      setShowCreateTaskDrawer(true);
    }
  };

  const handleCreateApprovalTask = (approvalTaskData) => {
    // Handle approval task creation logic here
    console.log("Approval task created:", approvalTaskData);
    setShowApprovalTaskModal(false);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-8">
        {/* Modern Header */}
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Tasks Management
                </h1>
                <p className="text-gray-600 mt-1">
                  Create, organize and track all your tasks efficiently
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSnooze(!showSnooze)}
                className={`inline-flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  showSnooze
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                {showSnooze ? "Hide" : "Show"} Snoozed Tasks
              </button>

              <div className="relative">
                <button
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  onClick={() => handleTaskTypeSelect("regular")}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Task
                </button>
                <button
                  className="ml-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  onClick={() => setShowTaskTypeDropdown(!showTaskTypeDropdown)}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {showTaskTypeDropdown && (
                  <>
                    <div
                      className="fixed z-50"
                      onClick={() => setShowTaskTypeDropdown(false)}
                    >
                      <div className="absolute right-0 top-full mt-2 w-72 z-50  bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 py-3">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                          Task Types
                        </div>
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 flex items-center gap-3"
                          onClick={() => handleTaskTypeSelect("regular")}
                        >
                          <span className="text-2xl">📋</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              Simple Task
                            </div>
                            <div className="text-sm text-gray-500">
                              Standard one-time task
                            </div>
                          </div>
                        </button>
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 flex items-center gap-3"
                          onClick={() => handleTaskTypeSelect("recurring")}
                        >
                          <span className="text-2xl">🔄</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              Recurring Task
                            </div>
                            <div className="text-sm text-gray-500">
                              Repeats on schedule
                            </div>
                          </div>
                        </button>
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 flex items-center gap-3"
                          onClick={() => handleTaskTypeSelect("milestone")}
                        >
                          <span className="text-2xl">🎯</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              Milestone
                            </div>
                            <div className="text-sm text-gray-500">
                              Project checkpoint
                            </div>
                          </div>
                        </button>
                        <button
                          className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 flex items-center gap-3"
                          onClick={() => handleTaskTypeSelect("approval")}
                        >
                          <span className="text-2xl">✅</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              Approval Task
                            </div>
                            <div className="text-sm text-gray-500">
                              Requires approval workflow
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Modal */}
        {showCalendarModal && (
          <CalendarDatePicker
            onClose={() => {
              setShowCalendarModal(false);
              setSelectedTaskType("regular");
            }}
            onDateSelect={handleCalendarDateSelect}
            taskType={selectedTaskType}
          />
        )}

        {/* Create Task Drawer */}
        {showCreateTaskDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0">
            <div
              className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCreateTaskDrawer(false)}
            ></div>
            <div
              className="absolute right-0 top-0 h-full bg-white/95 backdrop-blur-sm flex flex-col modal-animate-slide-right"
              style={{
                width: "min(90vw, 600px)",
                boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
                borderLeft: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div className="drawer-header">
                <h2 className="text-2xl font-bold text-white">
                  Create New Task
                  {selectedDateForTask &&
                    ` for ${new Date(selectedDateForTask).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}`}
                </h2>
                <button
                  onClick={() => setShowCreateTaskDrawer(false)}
                  className="close-btn"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="drawer-body">
                <CreateTask
                  onClose={() => {
                    setShowCreateTaskDrawer(false);
                    setSelectedDateForTask(null);
                  }}
                  initialTaskType={selectedTaskType}
                  preFilledDate={selectedDateForTask}
                />
              </div>
            </div>
          </div>
        )}

        {/* Approval Task Creator Modal */}
        {showApprovalTaskModal && (
          <div className="fixed inset-0 z-50 overflow-hidden overlay-animate mt-0">
            <div
              className="drawer-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowApprovalTaskModal(false)}
            ></div>
            <div
              className="absolute right-0 top-0 h-full bg-white/95 backdrop-blur-sm flex flex-col modal-animate-slide-right"
              style={{
                width: "min(90vw, 600px)",
                boxShadow: "-10px 0 50px rgba(0,0,0,0.2)",
                borderLeft: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div className="drawer-header">
                <h2 className="text-2xl font-bold text-white">
                  Create Approval Task
                  {selectedDateForTask &&
                    ` for ${new Date(selectedDateForTask).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}`}
                </h2>
                <button
                  onClick={() => setShowApprovalTaskModal(false)}
                  className="close-btn"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="drawer-body">
                <ApprovalTaskCreator
                  onClose={() => {
                    setShowApprovalTaskModal(false);
                    setSelectedDateForTask(null);
                  }}
                  onSubmit={handleCreateApprovalTask}
                  preFilledDate={selectedDateForTask}
                  selectedDate={selectedDateForTask}
                />
              </div>
            </div>
          </div>
        )}

        {/* View Tabs */}
        <div className="rounded-md border border-white/20 ">
          <Tabs
            value={activeView}
            onValueChange={setActiveView}
            className="w-full"
          >
            <TabsList className="grid w-80 grid-cols-2 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-1 shadow-inner">
              <TabsTrigger
                value="table"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-sm py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                <Table className="h-4 w-4" />
                <span>Table View</span>
              </TabsTrigger>
              <TabsTrigger
                value="kanban"
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-lg text-sm py-3 px-4 rounded-lg font-medium transition-all duration-200"
              >
                <Kanban className="h-4 w-4" />
                <span>Kanban View</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-6">
              <AllTasks />
            </TabsContent>

            <TabsContent value="kanban" className="mt-6">
              <TaskKanbanView />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
