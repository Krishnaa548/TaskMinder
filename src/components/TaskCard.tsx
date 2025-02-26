
import { Card } from "@/components/ui/card";
import { Task } from "@/lib/types";
import { format } from "date-fns";
import { Check, Clock } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, onComplete }: TaskCardProps) {
  return (
    <Card className="glass-card p-4 mb-4 animate-slide-in transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items
-center gap-2 mb-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs task-priority-${task.priority} rainbow-border`}>
              {task.priority}
            </span>
            <h3 className="text-lg font-semibold text-white/90">{task.title}</h3>
          </div>
          <p className="text-sm text-gray-400 mb-2">{task.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(task.dueDate), "PPP")}</span>
          </div>
        </div>
        <button
          onClick={() => onComplete(task.id)}
          className="ml-4 p-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Complete task"
        >
          <Check className={`w-5 h-5 ${task.completed ? "text-green-400" : "text-gray-600"}`} />
        </button>
      </div>
    </Card>
  );
}
