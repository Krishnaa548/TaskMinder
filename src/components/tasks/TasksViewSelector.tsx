
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, KanbanSquare, List } from "lucide-react";
import { ViewMode } from "@/lib/types";
import { ListView } from "./ListView";
import { KanbanView } from "./KanbanView";
import { CalendarView } from "./CalendarView";
import { Task, TaskTag } from "@/lib/types";

interface TasksViewSelectorProps {
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  filteredTasks: Task[];
  pendingTasks: Task[];
  inProgressTasks: Task[];
  completedTasks: Task[];
  overdueTasks: Task[];
  onDragEnd: (result: any) => void;
  onCompleteTask: (id: string) => void;
  currentTimeTracking: string | null;
  onToggleTimeTracking: (id: string) => void;
  enableTimeTracking: boolean;
  tags: TaskTag[];
}

export function TasksViewSelector({
  activeView,
  setActiveView,
  filteredTasks,
  pendingTasks,
  inProgressTasks,
  completedTasks,
  overdueTasks,
  onDragEnd,
  onCompleteTask,
  currentTimeTracking,
  onToggleTimeTracking,
  enableTimeTracking,
  tags
}: TasksViewSelectorProps) {
  return (
    <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewMode)} className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="list" className="flex items-center gap-1">
          <List className="w-4 h-4" />
          List
        </TabsTrigger>
        <TabsTrigger value="kanban" className="flex items-center gap-1">
          <KanbanSquare className="w-4 h-4" />
          Kanban
        </TabsTrigger>
        <TabsTrigger value="calendar" className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          Calendar
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="list" className="mt-0">
        <ListView 
          tasks={filteredTasks}
          onDragEnd={onDragEnd}
          onCompleteTask={onCompleteTask}
          currentTimeTracking={currentTimeTracking}
          onToggleTimeTracking={onToggleTimeTracking}
          enableTimeTracking={enableTimeTracking}
          tags={tags}
        />
      </TabsContent>
      
      <TabsContent value="kanban" className="mt-0">
        <KanbanView 
          pendingTasks={pendingTasks}
          inProgressTasks={inProgressTasks}
          completedTasks={completedTasks}
          overdueTasks={overdueTasks}
          onDragEnd={onDragEnd}
          currentTimeTracking={currentTimeTracking}
          onToggleTimeTracking={onToggleTimeTracking}
          enableTimeTracking={enableTimeTracking}
        />
      </TabsContent>
      
      <TabsContent value="calendar" className="mt-0">
        <CalendarView />
      </TabsContent>
    </Tabs>
  );
}
