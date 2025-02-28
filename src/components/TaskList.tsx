
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task, TaskAnalytics, TaskTag, UserPreferences, ViewMode, TimeEntry } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleCalendarIntegration } from "./GoogleCalendarIntegration";
import { SettingsModal, defaultUserPreferences } from "./SettingsModal";
import { Calendar, KanbanSquare, List, Clock, Zap, Tag } from "lucide-react";
import { Button } from "./ui/button";

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
      const now = new Date();
      setTasks((prev) =>
        prev.map((task) => {
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
            return task;
          }
          return task;
        })
      );
      setCurrentTimeTracking(null);
      toast({
        title: "Time Tracking Stopped",
        description: "Time tracking has been stopped for this task.",
      });
    } else {
      // Start tracking
      // If there's another task being tracked, stop it first
      if (currentTimeTracking) {
        toggleTimeTracking(currentTimeTracking);
      }
      
      const now = new Date();
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId) {
            const timeTracking = task.timeTracking || {
              estimatedTime: preferences.defaultTaskDuration,
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
        })
      );
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
  const analytics: TaskAnalytics = {
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

  const renderListView = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {filteredTasks.map((task, index) => (
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
                      isTracking={currentTimeTracking === task.id}
                      onToggleTimeTracking={
                        preferences.enableTimeTracking ? () => toggleTimeTracking(task.id) : undefined
                      }
                      tags={tags.filter(tag => task.tags?.includes(tag.id))}
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
  );

  const renderKanbanView = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Pending Column */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Pending ({pendingTasks.length})
          </h3>
          <Droppable droppableId="pending">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 min-h-[200px]"
              >
                {pendingTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="glass-card p-3"
                      >
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className="text-xs text-gray-400 truncate">{task.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full task-priority-${task.priority}`}>
                            {task.priority}
                          </span>
                          {preferences.enableTimeTracking && (
                            <button
                              onClick={() => toggleTimeTracking(task.id)}
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

        {/* In Progress Column */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            In Progress ({inProgressTasks.length})
          </h3>
          <Droppable droppableId="in-progress">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 min-h-[200px]"
              >
                {inProgressTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="glass-card p-3"
                      >
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className="text-xs text-gray-400 truncate">{task.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full task-priority-${task.priority}`}>
                            {task.priority}
                          </span>
                          {preferences.enableTimeTracking && (
                            <button
                              onClick={() => toggleTimeTracking(task.id)}
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

        {/* Completed Column */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Completed ({completedTasks.length})
          </h3>
          <Droppable droppableId="completed">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 min-h-[200px]"
              >
                {completedTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="glass-card p-3 opacity-70"
                      >
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className="text-xs text-gray-400 truncate">{task.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full task-priority-${task.priority}`}>
                            {task.priority}
                          </span>
                          {task.timeTracking?.actualTime && (
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

        {/* Overdue Column */}
        <div className="glass-card p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Overdue ({overdueTasks.length})
          </h3>
          <Droppable droppableId="overdue">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 min-h-[200px]"
              >
                {overdueTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="glass-card border-red-500/30 p-3"
                      >
                        <h4 className="font-semibold">{task.title}</h4>
                        <p className="text-xs text-gray-400 truncate">{task.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full task-priority-${task.priority}`}>
                            {task.priority}
                          </span>
                          {preferences.enableTimeTracking && (
                            <button
                              onClick={() => toggleTimeTracking(task.id)}
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
      </div>
    </DragDropContext>
  );

  const renderCalendarView = () => (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold mb-4">Calendar View</h3>
      <p className="text-center text-gray-400 p-8">
        Calendar view is coming soon! This will display your tasks on a monthly calendar.
      </p>
    </div>
  );

  return (
    <div className={`space-y-8 ${focusModeActive ? 'focus-mode' : ''}`}>
      {!focusModeActive && (
        <>
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
        </>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Tasks</h2>
          {currentTimeTracking && (
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full animate-pulse">
              Time tracking active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {preferences.focusMode.enabled && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleFocusMode}
              className="gap-1"
            >
              <Zap className="w-4 h-4" />
              {focusModeActive ? "Exit Focus Mode" : "Focus Mode"}
            </Button>
          )}
          <SettingsModal 
            preferences={preferences} 
            onSavePreferences={handleSavePreferences} 
          />
          <CreateTaskDialog 
            onCreateTask={handleCreateTask} 
            enableNaturalLanguage={preferences.enableNaturalLanguageInput}
            defaultPriority={preferences.defaultPriority}
            tags={tags}
          />
        </div>
      </div>

      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewMode)} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="list" className="flex items-center gap-1">
            <List className="w-4 h-4" />
            List
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-1">
            <KanbanSquare className="w-4 h-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-0">
          {renderListView()}
        </TabsContent>
        
        <TabsContent value="kanban" className="mt-0">
          {renderKanbanView()}
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-0">
          {renderCalendarView()}
        </TabsContent>
      </Tabs>

      {tasks.length === 0 && (
        <p className="text-center text-gray-500 py-8">No tasks yet. Create one to get started!</p>
      )}
    </div>
  );
}
