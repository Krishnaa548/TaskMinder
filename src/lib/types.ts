
export type TaskPriority = "low" | "medium" | "high";
export type NotificationChannel = "email" | "in-app" | "sms" | "push";
export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  completed: boolean;
  status: TaskStatus;
  notifications?: {
    channels: NotificationChannel[];
    frequency: number; // minutes
    lastNotified?: Date;
    snoozedUntil?: Date;
  };
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}
