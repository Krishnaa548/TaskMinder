
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Task } from "@/lib/types";
import { Clock } from "lucide-react";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  enableTimeTracking?: boolean;
  currentTimeTracking: string | null;
  onToggleTimeTracking?: (id: string) => void;
  showTimeTrackingControls?: boolean;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  color,
  enableTimeTracking = false,
  currentTimeTracking,
  onToggleTimeTracking,
  showTimeTrackingControls = true
}: KanbanColumnProps) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className={`w-3 h-3 ${color} rounded-full mr-2`}></span>
        {title} ({tasks.length})
      </h3>
      <Droppable droppableId={id}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3 min-h-[200px]"
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`glass-card p-3 ${id === "completed" ? "opacity-70" : ""} ${id === "overdue" ? "border-red-500/30" : ""}`}
                  >
                    <h4 className="font-semibold">{task.title}</h4>
                    <p className="text-xs text-gray-400 truncate">{task.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full task-priority-${task.priority}`}>
                        {task.priority}
                      </span>
                      {enableTimeTracking && showTimeTrackingControls && (
                        <button
                          onClick={() => onToggleTimeTracking?.(task.id)}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            currentTimeTracking === task.id 
                              ? "bg-green-500/20 text-green-400" 
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          <Clock className="w-3 h-3 inline mr-1" />
                          {currentTimeTracking === task.id ? "Stop" : "Start"}
                        </button>
                      )}
                      {!showTimeTrackingControls && task.timeTracking?.actualTime && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                          {task.timeTracking.actualTime} min
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
