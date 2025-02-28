
import { useEffect, useState } from "react";
import { Task, TaskAnalytics, TaskTag, UserPreferences, ViewMode } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { PomodoroTimer } from "./PomodoroTimer";
import { usePreferenceStore } from "@/stores/preferenceStore";
import { TaskListHeader } from "./tasks/TaskListHeader";
import { TaskAnalyticsDashboard } from "./tasks/TaskAnalyticsDashboard";
import { TasksViewSelector } from "./tasks/TasksViewSelector";
import { EmptyTaskList } from "./tasks/EmptyTaskList";
import { startTimeTracking, stopTimeTracking, calculateTaskAnalytics } from "@/utils/timeTrackingUtils";

// Define default user preferences outside the component to avoid using before declaration
const defaultUserPreferences: UserPreferences = {
  theme: "dark",
  defaultView: "list",
  defaultTaskDuration: 30,
  defaultPriority: "medium",
  showCompletedTasks: true,
  enableNotifications: true,
  notificationChannels: ["in-app"], // Fixed: Changed from readonly to regular array
  enableTimeTracking: true,
  enableCollaboration: false,
  enableSmartSuggestions: true,
  enableNaturalLanguageInput: true,
  integrations: {
    googleCalendar: false,
    slack: false,
    microsoftTeams: false,
  },
  focusMode: {
    enabled: false,
    hideNotifications: true,
    hideNavigation: false,
    pomodoroDuration: 25,
    breakDuration: 5,
  },
};

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<TaskTag[]>([
    { id: "1", name: "Work", color: "#4f46e5" },
    { id: "2", name: "Personal", color: "#ec4899" },
    { id: "3", name: "Health", color: "#10b981" },
    { id: "4", name: "Learning", color: "#f59e0b" },
  ]);
  const [activeView, setActiveView] = useState<ViewMode>("list");
  const [preferences, setPreferences] = useState<UserPreferences>(defaultUserPreferences);
  const [currentTimeTracking, setCurrentTimeTracking] = useState<string | null>(null);
  const [focusModeActive, setFocusModeActive] = useState(false);
  const { toast } = useToast();
  const preferenceStore = usePreferenceStore();

  // Initialize user preferences
  useEffect(() => {
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
      setActiveView(JSON.parse(savedPreferences).defaultView);
    }
  }, []);

  // Save preferences to localStorage
  const handleSavePreferences = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem("userPreferences", JSON.stringify(newPreferences));
    
    // Apply new preferences
    setActiveView(newPreferences.defaultView);
    
    // Sync with preference store
    preferenceStore.updatePreferences(newPreferences);
  };

  // Create a new task
  const handleCreateTask = (newTask: Omit<Task, "id" | "completed" | "status" | "createdAt" | "updatedAt">) => {
    const now = new Date();
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      completed: false,
      status: "pending",
      createdAt: now,
      updatedAt: now,
      timeTracking: preferences.enableTimeTracking 
        ? { 
            estimatedTime: preferences.defaultTaskDuration,
            actualTime: 0,
            entries: []
          } 
        : undefined
    };
    setTasks((prev) => [...prev, task]);
    toast({
      title: "Task Created",
      description: "Your new task has been created successfully.",
    });
  };

  // Toggle task completion
  const handleCompleteTask = (id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const completed = !task.completed;
          return {
            ...task,
            completed,
            status: completed ? "completed" : "pending",
            updatedAt: new Date()
          };
        }
        return task;
      })
    );
  };

  // Update task status
  const handleUpdateTaskStatus = (id: string, status: "pending" | "in-progress" | "completed" | "overdue") => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            status,
            completed: status === "completed",
            updatedAt: new Date()
          };
        }
        return task;
      })
    );
  };

  // Time tracking
  const toggleTimeTracking = (taskId: string) => {
    if (!preferences.enableTimeTracking) return;
    
    if (currentTimeTracking === taskId) {
      // Stop tracking
      setTasks(prevTasks => stopTimeTracking(prevTasks, taskId));
      setCurrentTimeTracking(null);
      toast({
        title: "Time Tracking Stopped",
        description: "Time tracking has been stopped for this task.",
      });
    } else {
      // Start tracking
      // If there's another task being tracked, stop it first
      if (currentTimeTracking) {
        setTasks(prevTasks => stopTimeTracking(prevTasks, currentTimeTracking));
      }
      
      setTasks(prevTasks => startTimeTracking(prevTasks, taskId, preferences.defaultTaskDuration));
      setCurrentTimeTracking(taskId);
      toast({
        title: "Time Tracking Started",
        description: "Time tracking has been started for this task.",
      });
    }
  };

  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusModeActive(!focusModeActive);
    toast({
      title: focusModeActive ? "Focus Mode Deactivated" : "Focus Mode Activated",
      description: focusModeActive 
        ? "You've exited focus mode." 
        : "Distractions minimized. Focus on your current task.",
    });
  };

  // Handle drag and drop
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    if (activeView === "list") {
      const items = Array.from(tasks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setTasks(items);
    } else if (activeView === "kanban") {
      const sourceStatus = result.source.droppableId;
      const destinationStatus = result.destination.droppableId;
      
      if (sourceStatus === destinationStatus) {
        // Reordering within the same column
        const columnTasks = tasks.filter(t => t.status === sourceStatus);
        const orderedTasks = Array.from(columnTasks);
        const [movedTask] = orderedTasks.splice(result.source.index, 1);
        orderedTasks.splice(result.destination.index, 0, movedTask);
        
        // Merge the ordered tasks with the rest of the tasks
        const updatedTasks = tasks.filter(t => t.status !== sourceStatus);
        setTasks([...updatedTasks, ...orderedTasks]);
      } else {
        // Moving between columns
        setTasks(prev => 
          prev.map(task => {
            if (task.id === result.draggableId) {
              return {
                ...task,
                status: destinationStatus as "pending" | "in-progress" | "completed" | "overdue",
                completed: destinationStatus === "completed",
                updatedAt: new Date()
              };
            }
            return task;
          })
        );
      }
    }
  };

  // Calculate analytics data
  const analytics: TaskAnalytics = calculateTaskAnalytics(tasks);

  const chartData = [
    { name: 'High', tasks: analytics.priorityDistribution.high },
    { name: 'Medium', tasks: analytics.priorityDistribution.medium },
    { name: 'Low', tasks: analytics.priorityDistribution.low },
  ];

  // Filter tasks based on user preferences
  const filteredTasks = tasks.filter(task => {
    if (!preferences.showCompletedTasks && task.completed) {
      return false;
    }
    return true;
  });

  // Group tasks by status for Kanban view
  const pendingTasks = filteredTasks.filter(t => t.status === "pending");
  const inProgressTasks = filteredTasks.filter(t => t.status === "in-progress");
  const completedTasks = filteredTasks.filter(t => t.status === "completed");
  const overdueTasks = filteredTasks.filter(t => t.status === "overdue");

  return (
    <div className={`space-y-8 ${focusModeActive ? 'focus-mode' : ''}`}>
      {focusModeActive && preferences.focusMode.enabled && (
        <PomodoroTimer />
      )}
      
      {!focusModeActive && (
        <TaskAnalyticsDashboard 
          analytics={analytics} 
          chartData={chartData}
          tasks={tasks}
        />
      )}

      <TaskListHeader 
        currentTimeTracking={currentTimeTracking}
        preferences={preferences}
        focusModeActive={focusModeActive}
        toggleFocusMode={toggleFocusMode}
        handleSavePreferences={handleSavePreferences}
        handleCreateTask={handleCreateTask}
        tags={tags}
      />

      <TasksViewSelector 
        activeView={activeView}
        setActiveView={setActiveView}
        filteredTasks={filteredTasks}
        pendingTasks={pendingTasks}
        inProgressTasks={inProgressTasks}
        completedTasks={completedTasks}
        overdueTasks={overdueTasks}
        onDragEnd={onDragEnd}
        onCompleteTask={handleCompleteTask}
        currentTimeTracking={currentTimeTracking}
        onToggleTimeTracking={toggleTimeTracking}
        enableTimeTracking={preferences.enableTimeTracking}
        tags={tags}
      />

      {tasks.length === 0 && <EmptyTaskList />}
    </div>
  );
}
