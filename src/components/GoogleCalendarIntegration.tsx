
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/types";

interface GoogleCalendarIntegrationProps {
  tasks: Task[];
}

export function GoogleCalendarIntegration({ tasks }: GoogleCalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  // Mock function to simulate Google Calendar API access
  const connectToGoogleCalendar = () => {
    setIsSyncing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnected(true);
      setIsSyncing(false);
      toast({
        title: "Connected to Google Calendar",
        description: "Your TaskMinder account is now linked to Google Calendar.",
      });
    }, 1500);
  };

  // Mock function to simulate syncing tasks to Google Calendar
  const syncTasksToCalendar = () => {
    if (!isConnected) {
      toast({
        title: "Not connected",
        description: "Please connect to Google Calendar first.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSyncing(false);
      toast({
        title: "Tasks synced",
        description: `Successfully synced ${tasks.length} tasks to your Google Calendar.`,
      });
    }, 2000);
  };

  // Mock function to disconnect from Google Calendar
  const disconnectFromGoogleCalendar = () => {
    setIsSyncing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnected(false);
      setIsSyncing(false);
      toast({
        title: "Disconnected",
        description: "Your TaskMinder account has been disconnected from Google Calendar.",
      });
    }, 1500);
  };

  return (
    <Card className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold">Google Calendar</h3>
        </div>
        {isConnected ? (
          <div className="flex items-center gap-1 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            <span>Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-400 text-sm">
            <X className="w-4 h-4" />
            <span>Not connected</span>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Sync your tasks with Google Calendar to keep track of deadlines and receive reminders.
      </p>
      
      <div className="flex flex-wrap gap-2">
        {!isConnected ? (
          <Button 
            onClick={connectToGoogleCalendar}
            disabled={isSyncing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSyncing ? "Connecting..." : "Connect"}
          </Button>
        ) : (
          <>
            <Button 
              onClick={syncTasksToCalendar}
              disabled={isSyncing}
              variant="outline"
              className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
            >
              {isSyncing ? "Syncing..." : "Sync Tasks"}
            </Button>
            <Button 
              onClick={disconnectFromGoogleCalendar}
              disabled={isSyncing}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              {isSyncing ? "Disconnecting..." : "Disconnect"}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
