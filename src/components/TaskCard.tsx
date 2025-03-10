
import { Card } from "@/components/ui/card";
import { Task, TaskTag } from "@/lib/types";
import { format } from "date-fns";
import { Check, Clock, GripVertical, Tag } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  isTracking?: boolean;
  onToggleTimeTracking?: () => void;
  tags?: TaskTag[];
}

export function TaskCard({ 
  task, 
  onComplete, 
  isTracking = false,
  onToggleTimeTracking,
  tags = []
}: TaskCardProps) {
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <Card className={`glass-card p-4 mb-4 animate-slide-in transition-all duration-300 group hover:bg-black/40 ${isOverdue ? 'border-red-500/50' : ''}`}>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <GripVertical className="w-5 h-5 text-gray-500 cursor-move transition-colors duration-300 group-hover:text-gray-400" />
            <span className={`inline-block px-2 py-1 rounded-full text-xs task-priority-${task.priority} rainbow-border transition-colors duration-300`}>
              {task.priority}
            </span>
            <h3 className="text-lg font-semibold text-white/90 transition-colors duration-300 group-hover:text-white">
              {task.title}
            </h3>
            {isTracking && (
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full animate-pulse">
                Tracking
              </span>
            )}
          </div>

          <p className="text-sm text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-300">
            {task.description}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map(tag => (
                <span 
                  key={tag.id}
                  style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                  className="text-xs px-2 py-0.5 rounded-full flex items-center"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className={`w-4 h-4 transition-colors duration-300 ${isOverdue ? 'text-red-500' : ''}`} />
            <span className={`transition-colors duration-300 group-hover:text-gray-400 ${isOverdue ? 'text-red-500' : ''}`}>
              {format(new Date(task.dueDate), "PPP")}
              {isOverdue && " (Overdue)"}
            </span>
            
            {task.timeTracking && (
              <span className="text-blue-400 ml-2">
                {task.timeTracking.actualTime || 0}/{task.timeTracking.estimatedTime || 0} min
              </span>
            )}
            
            {task.recurrence && (
              <span className="text-purple-400 ml-2">
                Repeats {task.recurrence.frequency} (every {task.recurrence.interval})
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {onToggleTimeTracking && (
            <button
              onClick={onToggleTimeTracking}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors duration-300 ${
                isTracking ? 'text-green-400' : 'text-gray-600 group-hover:text-gray-500'
              }`}
              aria-label={isTracking ? "Stop time tracking" : "Start time tracking"}
            >
              <Clock className="w-5 h-5" />
            </button>
          )}
          
          <button
            onClick={() => onComplete(task.id)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-300"
            aria-label="Complete task"
          >
            <Check 
              className={`w-5 h-5 transition-colors duration-300 
                ${task.completed ? "text-green-400" : "text-gray-600"}
                group-hover:${task.completed ? "text-green-300" : "text-gray-500"}
              `}
            />
          </button>
        </div>
      </div>
    </Card>
  );
}
