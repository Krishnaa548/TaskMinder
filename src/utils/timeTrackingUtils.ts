
import { Task, TimeEntry } from "@/lib/types";

export function startTimeTracking(
  tasks: Task[],
  taskId: string,
  defaultDuration: number
): Task[] {
  const now = new Date();
  
  return tasks.map((task) => {
    if (task.id === taskId) {
      const timeTracking = task.timeTracking || {
        estimatedTime: defaultDuration,
        actualTime: 0,
        entries: []
      };
      
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        taskId,
        startTime: now
      };
      
      return {
        ...task,
        timeTracking: {
          ...timeTracking,
          entries: [...timeTracking.entries, newEntry]
        },
        updatedAt: now
      };
    }
    return task;
  });
}

export function stopTimeTracking(
  tasks: Task[],
  taskId: string
): Task[] {
  const now = new Date();

  return tasks.map((task) => {
    if (task.id === taskId && task.timeTracking) {
      const entries = [...(task.timeTracking.entries || [])];
      const currentEntry = entries[entries.length - 1];
      
      if (currentEntry && !currentEntry.endTime) {
        const startTime = new Date(currentEntry.startTime);
        const durationMs = now.getTime() - startTime.getTime();
        const durationMinutes = Math.round(durationMs / 60000);
        
        const updatedEntry = {
          ...currentEntry,
          endTime: now,
          duration: durationMinutes
        };
        
        entries[entries.length - 1] = updatedEntry;
        
        const totalDuration = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        
        return {
          ...task,
          timeTracking: {
            ...task.timeTracking,
            entries,
            actualTime: totalDuration
          },
          updatedAt: now
        };
      }
    }
    return task;
  });
}

export function calculateTaskAnalytics(tasks: Task[]) {
  return {
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
}
