
import { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { useState } from "react";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleCreateTask = (newTask: Omit<Task, "id" | "completed">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
    };
    setTasks((prev) => [...prev, task]);
  };

  const handleCompleteTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <CreateTaskDialog onCreateTask={handleCreateTask} />
      </div>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onComplete={handleCompleteTask}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 py-8">No tasks yet. Create one to get started!</p>
        )}
      </div>
    </div>
  );
}
