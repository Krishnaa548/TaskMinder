
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { SettingsModal } from "../SettingsModal";
import { CreateTaskDialog } from "../CreateTaskDialog";
import { TaskTag, UserPreferences } from "@/lib/types";

interface TaskListHeaderProps {
  currentTimeTracking: string | null;
  preferences: UserPreferences;
  focusModeActive: boolean;
  toggleFocusMode: () => void;
  handleSavePreferences: (newPreferences: UserPreferences) => void;
  handleCreateTask: (newTask: any) => void;
  tags: TaskTag[];
}

export function TaskListHeader({
  currentTimeTracking,
  preferences,
  focusModeActive,
  toggleFocusMode,
  handleSavePreferences,
  handleCreateTask,
  tags
}: TaskListHeaderProps) {
  return (
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
  );
}
