import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Settings, Save } from "lucide-react";
import { NotificationChannel, TaskPriority, ThemeMode, UserPreferences, ViewMode } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Default user preferences
export const defaultUserPreferences: UserPreferences = {
  theme: "dark",
  defaultView: "list",
  defaultTaskDuration: 30,
  defaultPriority: "medium",
  showCompletedTasks: true,
  enableNotifications: true,
  notificationChannels: ["in-app"],
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

interface SettingsModalProps {
  preferences: UserPreferences;
  onSavePreferences: (preferences: UserPreferences) => void;
}

export function SettingsModal({ preferences, onSavePreferences }: SettingsModalProps) {
  const [open, setOpen] = useState(false);
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);
  const { toast } = useToast();

  const handleSave = () => {
    onSavePreferences(localPreferences);
    setOpen(false);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setLocalPreferences(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedPreference = (
    parentKey: keyof UserPreferences,
    childKey: string,
    value: any
  ) => {
    setLocalPreferences(prev => {
      // Create a properly typed copy of the nested object
      const parentObject = {...prev[parentKey] as object};
      
      return {
        ...prev,
        [parentKey]: {
          ...parentObject,
          [childKey]: value,
        },
      };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="rainbow-text">User Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Appearance */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Appearance</h3>
            
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <select
                id="theme"
                value={localPreferences.theme}
                onChange={(e) => updatePreference('theme', e.target.value as ThemeMode)}
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System Default</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultView">Default View</Label>
              <select
                id="defaultView"
                value={localPreferences.defaultView}
                onChange={(e) => updatePreference('defaultView', e.target.value as ViewMode)}
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
              >
                <option value="list">List</option>
                <option value="kanban">Kanban Board</option>
                <option value="calendar">Calendar</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="showCompletedTasks">Show Completed Tasks</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="showCompletedTasks" 
                  checked={localPreferences.showCompletedTasks}
                  onCheckedChange={(checked) => updatePreference('showCompletedTasks', checked)}
                />
                <span className="text-sm text-gray-400">
                  {localPreferences.showCompletedTasks ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Task Defaults */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Task Defaults</h3>
            
            <div className="space-y-2">
              <Label htmlFor="defaultPriority">Default Priority</Label>
              <select
                id="defaultPriority"
                value={localPreferences.defaultPriority}
                onChange={(e) => updatePreference('defaultPriority', e.target.value as TaskPriority)}
                className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultTaskDuration">Default Task Duration (minutes)</Label>
              <Input
                id="defaultTaskDuration"
                type="number"
                value={localPreferences.defaultTaskDuration}
                onChange={(e) => updatePreference('defaultTaskDuration', parseInt(e.target.value))}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Features</h3>
            
            <div className="space-y-2">
              <Label htmlFor="enableTimeTracking">Enable Time Tracking</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enableTimeTracking" 
                  checked={localPreferences.enableTimeTracking}
                  onCheckedChange={(checked) => updatePreference('enableTimeTracking', checked)}
                />
                <span className="text-sm text-gray-400">
                  {localPreferences.enableTimeTracking ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="enableSmartSuggestions">Enable Smart Suggestions</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enableSmartSuggestions" 
                  checked={localPreferences.enableSmartSuggestions}
                  onCheckedChange={(checked) => updatePreference('enableSmartSuggestions', checked)}
                />
                <span className="text-sm text-gray-400">
                  {localPreferences.enableSmartSuggestions ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="enableNaturalLanguageInput">Enable Natural Language Input</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enableNaturalLanguageInput" 
                  checked={localPreferences.enableNaturalLanguageInput}
                  onCheckedChange={(checked) => updatePreference('enableNaturalLanguageInput', checked)}
                />
                <span className="text-sm text-gray-400">
                  {localPreferences.enableNaturalLanguageInput ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="enableCollaboration">Enable Collaboration</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enableCollaboration" 
                  checked={localPreferences.enableCollaboration}
                  onCheckedChange={(checked) => updatePreference('enableCollaboration', checked)}
                />
                <span className="text-sm text-gray-400">
                  {localPreferences.enableCollaboration ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notifications</h3>
            
            <div className="space-y-2">
              <Label htmlFor="enableNotifications">Enable Notifications</Label>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="enableNotifications" 
                  checked={localPreferences.enableNotifications}
                  onCheckedChange={(checked) => updatePreference('enableNotifications', checked)}
                />
                <span className="text-sm text-gray-400">
                  {localPreferences.enableNotifications ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="block mb-2">Notification Channels</Label>
              <div className="space-y-2">
                {['email', 'in-app', 'sms', 'push'].map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`channel-${channel}`}
                      checked={localPreferences.notificationChannels.includes(channel as NotificationChannel)}
                      onChange={(e) => {
                        const updatedChannels = e.target.checked
                          ? [...localPreferences.notificationChannels, channel as NotificationChannel]
                          : localPreferences.notificationChannels.filter(c => c !== channel);
                        updatePreference('notificationChannels', updatedChannels);
                      }}
                      className="rounded bg-white/10 border-white/20"
                    />
                    <Label htmlFor={`channel-${channel}`} className="capitalize">{channel}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Integrations */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Integrations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="integration-googleCalendar">Google Calendar</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="integration-googleCalendar" 
                    checked={localPreferences.integrations.googleCalendar}
                    onCheckedChange={(checked) => updateNestedPreference('integrations', 'googleCalendar', checked)}
                  />
                  <span className="text-sm text-gray-400">
                    {localPreferences.integrations.googleCalendar ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="integration-slack">Slack</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="integration-slack" 
                    checked={localPreferences.integrations.slack}
                    onCheckedChange={(checked) => updateNestedPreference('integrations', 'slack', checked)}
                  />
                  <span className="text-sm text-gray-400">
                    {localPreferences.integrations.slack ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="integration-microsoftTeams">Microsoft Teams</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="integration-microsoftTeams" 
                    checked={localPreferences.integrations.microsoftTeams}
                    onCheckedChange={(checked) => updateNestedPreference('integrations', 'microsoftTeams', checked)}
                  />
                  <span className="text-sm text-gray-400">
                    {localPreferences.integrations.microsoftTeams ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Focus Mode */}
          <div className="space-y-4 md:col-span-2">
            <h3 className="text-lg font-semibold">Focus Mode</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusMode-enabled">Enable Focus Mode</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="focusMode-enabled" 
                    checked={localPreferences.focusMode.enabled}
                    onCheckedChange={(checked) => updateNestedPreference('focusMode', 'enabled', checked)}
                  />
                  <span className="text-sm text-gray-400">
                    {localPreferences.focusMode.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="focusMode-hideNotifications">Hide Notifications</Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="focusMode-hideNotifications" 
                    checked={localPreferences.focusMode.hideNotifications}
                    onCheckedChange={(checked) => updateNestedPreference('focusMode', 'hideNotifications', checked)}
                  />
                  <span className="text-sm text-gray-400">
                    {localPreferences.focusMode.hideNotifications ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="focusMode-pomodoroDuration">Pomodoro Duration (minutes)</Label>
                <Input
                  id="focusMode-pomodoroDuration"
                  type="number"
                  value={localPreferences.focusMode.pomodoroDuration}
                  onChange={(e) => updateNestedPreference('focusMode', 'pomodoroDuration', parseInt(e.target.value))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="focusMode-breakDuration">Break Duration (minutes)</Label>
                <Input
                  id="focusMode-breakDuration"
                  type="number"
                  value={localPreferences.focusMode.breakDuration}
                  onChange={(e) => updateNestedPreference('focusMode', 'breakDuration', parseInt(e.target.value))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
