
import { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleCalendarIntegration } from "./GoogleCalendarIntegration";

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();

  const handleCreateTask = (newTask: Omit<Task, "id" | "completed" | "status">) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      status: "pending",
    };
    setTasks((prev) => [...prev, task]);
    toast({
      title: "Task Created",
      description: "Your new task has been created successfully.",
    });
  };

  const handleCompleteTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const completed = !task.completed;
          return {
            ...task,
            completed,
            status: completed ? "completed" : "pending"
          };
        }
        return task;
      })
    );
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTasks(items);
  };

  // Calculate analytics data
  const analytics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.completed).length,
    overdueTasks: tasks.filter(t => new Date(t.dueDate) < new Date() && !t.completed).length,
    upcomingTasks: tasks.filter(t => new Date(t.dueDate) > new Date()).length,
    priorityDistribution: {
      high: tasks.filter(t => t.priority === "high").length,
      medium: tasks.filter(t => t.priority === "medium").length,
      low: tasks.filter(t => t.priority === "low").length,
    }
  };

  const chartData = [
    { name: 'High', tasks: analytics.priorityDistribution.high },
    { name: 'Medium', tasks: analytics.priorityDistribution.medium },
    { name: 'Low', tasks: analytics.priorityDistribution.low },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-4">
          <h3 className="text-sm text-gray-400">Total Tasks</h3>
          <p className="text-2xl font-bold">{analytics.totalTasks}</p>
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm text-gray-400">Completed</h3>
          <p className="text-2xl font-bold text-green-400">{analytics.completedTasks}</p>
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm text-gray-400">Overdue</h3>
          <p className="text-2xl font-bold text-red-400">{analytics.overdueTasks}</p>
        </div>
        <div className="glass-card p-4">
          <h3 className="text-sm text-gray-400">Upcoming</h3>
          <p className="text-2xl font-bold text-blue-400">{analytics.upcomingTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 glass-card p-4">
          <h3 className="text-lg font-semibold mb-4">Task Priority Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tasks" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="md:col-span-1">
          <GoogleCalendarIntegration tasks={tasks} />
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <CreateTaskDialog onCreateTask={handleCreateTask} />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TaskCard
                        task={task}
                        onComplete={handleCompleteTask}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {tasks.length === 0 && (
        <p className="text-center text-gray-500 py-8">No tasks yet. Create one to get started!</p>
      )}
    </div>
  );
}
