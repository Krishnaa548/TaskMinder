
import { Card } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { format } from "date-fns";
import { Check, Clock, GripVertical } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <Card className={`glass-card p-4 mb-4 animate-slide-in transition-all duration-500 group ${isOverdue ? 'border-red-500/50' : ''}`}>
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <GripVertical className="w-5 h-5 text-gray-500 cursor-move" />
            <span className={`inline-block px-2 py-1 rounded-full text-xs task-priority-${task.priority} rainbow-border transition-all duration-300 group-hover:scale-110`}>
              {task.priority}
            </span>
            <h3 className="text-lg font-semibold text-white/90 transition-colors duration-300 group-hover:text-white">
              {task.title}
            </h3>
          </div>
          <p className="text-sm text-gray-400 mb-2 transition-colors duration-300 group-hover:text-gray-300">
            {task.description}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isOverdue ? 'text-red-500' : ''}`} />
            <span className={`transition-colors duration-300 group-hover:text-gray-400 ${isOverdue ? 'text-red-500' : ''}`}>
              {format(new Date(task.dueDate), "PPP")}
              {isOverdue && " (Overdue)"}
            </span>
          </div>
        </div>
        <button
          onClick={() => onComplete(task.id)}
          className="ml-4 p-2 rounded-full hover:bg-white/5 transition-all duration-300 hover:scale-110"
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
    </Card>
  );
}
