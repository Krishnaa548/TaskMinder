
export type TaskPriority = "low" | "medium" | "high";
export type NotificationChannel = "email" | "in-app" | "sms" | "push";
export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";
export type ViewMode = "list" | "kanban" | "calendar";
export type ThemeMode = "dark" | "light" | "system";

export interface TaskTag {
  id: string;
  name: string;
  color: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  tags: string[]; // tag IDs
  estimatedTime?: number; // minutes
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // minutes
  notes?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: TaskPriority;
  completed: boolean;
  status: TaskStatus;
  tags?: string[]; // IDs of tags
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: Date;
    count?: number;
  };
  timeTracking?: {
    estimatedTime?: number; // minutes
    actualTime?: number; // minutes
    entries: TimeEntry[];
  };
  dependencies?: string[]; // IDs of tasks this task depends on
  collaborators?: string[]; // IDs or emails of collaborators
  notifications?: {
    channels: NotificationChannel[];
    frequency: number; // minutes
    lastNotified?: Date;
    snoozedUntil?: Date;
  };
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  averageCompletionTime?: number; // minutes
  mostProductiveDay?: string;
  mostProductiveTime?: string;
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  completionRateByTag?: Record<string, number>;
  timeSpentByTag?: Record<string, number>;
}

export interface UserPreferences {
  theme: ThemeMode;
  defaultView: ViewMode;
  defaultTaskDuration: number; // minutes
  defaultPriority: TaskPriority;
  showCompletedTasks: boolean;
  enableNotifications: boolean;
  notificationChannels: NotificationChannel[];
  enableTimeTracking: boolean;
  enableCollaboration: boolean;
  enableSmartSuggestions: boolean;
  enableNaturalLanguageInput: boolean;
  integrations: {
    googleCalendar: boolean;
    slack: boolean;
    microsoftTeams: boolean;
  };
  focusMode: {
    enabled: boolean;
    hideNotifications: boolean;
    hideNavigation: boolean;
    pomodoroDuration: number; // minutes
    breakDuration: number; // minutes
  };
}
