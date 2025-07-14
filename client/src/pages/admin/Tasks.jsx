import { useState } from "react";
import { TaskTableView } from "@/components/tasks/TaskTableView";
import { TaskKanbanView } from "@/components/tasks/TaskKanbanView";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, Kanban, Plus } from "lucide-react";

export default function Tasks() {
  const [activeView, setActiveView] = useState("table");

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Tasks Management
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create, organize and track all your tasks
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 text-slate-700 hover:bg-slate-100 text-sm px-3 py-1"
          >
            Export Tasks
          </Button>
          <Button
            size="sm"
            className="bg-blue-600 text-white text-sm px-3 py-1"
          >
            <Plus className="h-3 w-3 mr-1" />
            New Task
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-64 grid-cols-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5">
          <TabsTrigger
            value="table"
            className="flex items-center space-x-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-sm py-1.5"
          >
            <Table className="h-3 w-3" />
            <span>Table</span>
          </TabsTrigger>
          <TabsTrigger
            value="kanban"
            className="flex items-center space-x-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 text-sm py-1.5"
          >
            <Kanban className="h-3 w-3" />
            <span>Kanban</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-3">
          <TaskTableView />
        </TabsContent>

        <TabsContent value="kanban" className="mt-3">
          <TaskKanbanView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
