
import { DragDropContext } from "@hello-pangea/dnd";
import { Task } from "@/lib/types";
import { KanbanColumn } from "./KanbanColumn";

interface KanbanViewProps {
  pendingTasks: Task[];
  inProgressTasks: Task[];
  completedTasks: Task[];
  overdueTasks: Task[];
  onDragEnd: (result: any) => void;
  currentTimeTracking: string | null;
  onToggleTimeTracking: (taskId: string) => void;
  enableTimeTracking: boolean;
}

export function KanbanView({
  pendingTasks,
  inProgressTasks,
  completedTasks,
  overdueTasks,
  onDragEnd,
  currentTimeTracking,
  onToggleTimeTracking,
  enableTimeTracking
}: KanbanViewProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KanbanColumn
          id="pending"
          title="Pending"
          tasks={pendingTasks}
          color="bg-yellow-500"
          enableTimeTracking={enableTimeTracking}
          currentTimeTracking={currentTimeTracking}
          onToggleTimeTracking={onToggleTimeTracking}
        />
        <KanbanColumn
          id="in-progress"
          title="In Progress"
          tasks={inProgressTasks}
          color="bg-blue-500"
          enableTimeTracking={enableTimeTracking}
          currentTimeTracking={currentTimeTracking}
          onToggleTimeTracking={onToggleTimeTracking}
        />
        <KanbanColumn
          id="completed"
          title="Completed"
          tasks={completedTasks}
          color="bg-green-500"
          enableTimeTracking={enableTimeTracking}
          currentTimeTracking={currentTimeTracking}
          onToggleTimeTracking={onToggleTimeTracking}
          showTimeTrackingControls={false}
        />
        <KanbanColumn
          id="overdue"
          title="Overdue"
          tasks={overdueTasks}
          color="bg-red-500"
          enableTimeTracking={enableTimeTracking}
          currentTimeTracking={currentTimeTracking}
          onToggleTimeTracking={onToggleTimeTracking}
        />
      </div>
    </DragDropContext>
  );
}
