
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Check, AlertCircle, X, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface GoogleCalendarIntegrationProps {
  tasks: Task[];
}

export function GoogleCalendarIntegration({ tasks }: GoogleCalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [calendarEmail, setCalendarEmail] = useState("");
  const { toast } = useToast();

  // Function to connect to Google Calendar (mock implementation)
  const connectToGoogleCalendar = () => {
    setShowAuthDialog(true);
  };

  // Function to handle the auth dialog submission
  const handleAuthSubmit = () => {
    if (!calendarEmail) {
      toast({
        title: "Email required",
        description: "Please enter your Google account email.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSyncing(true);
    setShowAuthDialog(false);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnected(true);
      setIsSyncing(false);
      toast({
        title: "Connected to Google Calendar",
        description: `Your TaskMinder account is now linked to Google Calendar (${calendarEmail}).`,
      });
    }, 1500);
  };

  // Function to sync tasks to Google Calendar (mock implementation)
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

  // Function to disconnect from Google Calendar (mock implementation)
  const disconnectFromGoogleCalendar = () => {
    setIsSyncing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsConnected(false);
      setIsSyncing(false);
      setCalendarEmail("");
      toast({
        title: "Disconnected",
        description: "Your TaskMinder account has been disconnected from Google Calendar.",
      });
    }, 1500);
  };

  return (
    <>
      <Card className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Google Calendar</h3>
          </div>
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <Check className="w-4 h-4" />
              <span>Connected to {calendarEmail}</span>
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
          <span className="block mt-1 text-yellow-300">
            <AlertCircle className="w-3 h-3 inline-block mr-1" />
            This is a demo integration - no actual Google account connection is made.
          </span>
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

      {/* Multi-app Integrations Card */}
      <Card className="glass-card p-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">Multi-App Task Management</h3>
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mb-4">
          Connect with other productivity apps to manage all your tasks in one place.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" className="border-purple-500 text-purple-500 hover:bg-purple-500/10 justify-start">
            <img src="https://cdn.worldvectorlogo.com/logos/trello.svg" alt="Trello" className="w-4 h-4 mr-2" />
            Connect to Trello
          </Button>
          <Button variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-500/10 justify-start">
            <img src="https://cdn.worldvectorlogo.com/logos/asana-logo.svg" alt="Asana" className="w-4 h-4 mr-2" />
            Connect to Asana
          </Button>
          <Button variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10 justify-start">
            <img src="https://cdn.worldvectorlogo.com/logos/todoist-2.svg" alt="Todoist" className="w-4 h-4 mr-2" />
            Connect to Todoist
          </Button>
          <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 justify-start">
            <img src="https://cdn.worldvectorlogo.com/logos/notion-2.svg" alt="Notion" className="w-4 h-4 mr-2" />
            Connect to Notion
          </Button>
        </div>
      </Card>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="glass-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="rainbow-text">Connect to Google Calendar</DialogTitle>
            <DialogDescription>
              Enter your Google account email to connect to Google Calendar.
              <span className="block mt-2 text-yellow-300 font-medium">
                This is a demo integration - no actual authentication happens.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={calendarEmail}
                onChange={(e) => setCalendarEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="col-span-3 bg-white/10 border-white/20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAuthDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAuthSubmit}>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
