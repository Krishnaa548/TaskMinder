
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Check, AlertCircle, X, ExternalLink, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoogleLogin } from '@react-oauth/google';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Constant for Google API scopes
const GOOGLE_CALENDAR_SCOPES = ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'];

interface GoogleCalendarIntegrationProps {
  tasks: Task[];
}

export function GoogleCalendarIntegration({ tasks }: GoogleCalendarIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  // Load connection status from localStorage on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('google_calendar_token');
    const savedEmail = localStorage.getItem('google_calendar_email');
    
    if (savedToken && savedEmail) {
      setToken(savedToken);
      setUserEmail(savedEmail);
      setIsConnected(true);
    }
  }, []);

  // Google OAuth login hook
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsSyncing(true);
        
        // Get user info with the token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` }
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info');
        }
        
        const userInfo = await userInfoResponse.json();
        
        // Store token and user email
        localStorage.setItem('google_calendar_token', response.access_token);
        localStorage.setItem('google_calendar_email', userInfo.email);
        
        setToken(response.access_token);
        setUserEmail(userInfo.email);
        setIsConnected(true);
        setErrorMessage(null);
        
        toast({
          title: "Connected to Google Calendar",
          description: `Your TaskMinder account is now linked to Google Calendar (${userInfo.email}).`,
        });
      } catch (error) {
        console.error('Google Calendar connection error:', error);
        setErrorMessage('Failed to connect to Google Calendar. Please try again.');
        
        toast({
          title: "Connection failed",
          description: "Could not connect to Google Calendar. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSyncing(false);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
      setErrorMessage('Google authentication failed. Please try again.');
      
      toast({
        title: "Authentication failed",
        description: "Google authentication failed. Please try again.",
        variant: "destructive",
      });
      
      setIsSyncing(false);
    },
    scope: GOOGLE_CALENDAR_SCOPES.join(' '),
    flow: 'implicit',
  });

  // Function to sync tasks to Google Calendar
  const syncTasksToCalendar = async () => {
    if (!isConnected || !token) {
      toast({
        title: "Not connected",
        description: "Please connect to Google Calendar first.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // Create events for each task with a due date
      for (const task of tasks) {
        if (!task.dueDate) continue;
        
        // Parse the due date and set up event times
        const dueDate = new Date(task.dueDate);
        const endTime = new Date(dueDate);
        endTime.setMinutes(endTime.getMinutes() + 30); // Default to 30 min events
        
        // Create event payload
        const event = {
          summary: task.title,
          description: task.description,
          start: {
            dateTime: dueDate.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          reminders: {
            useDefault: true
          }
        };
        
        // Send request to Google Calendar API
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        });
        
        if (response.ok) {
          successCount++;
        } else {
          console.error('Failed to create event for task:', task.title);
          errorCount++;
        }
      }
      
      // Show success or partial success toast
      if (errorCount === 0) {
        toast({
          title: "Tasks synced",
          description: `Successfully synced ${successCount} tasks to your Google Calendar.`,
        });
      } else {
        toast({
          title: "Sync partial",
          description: `Synced ${successCount} tasks, but ${errorCount} failed. Check console for details.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error syncing tasks:', error);
      
      toast({
        title: "Sync failed",
        description: "Failed to sync tasks to Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Function to disconnect from Google Calendar
  const disconnectFromGoogleCalendar = () => {
    setIsSyncing(true);
    
    // Revoke token access (best practice)
    if (token) {
      fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).catch(error => {
        console.error('Error revoking token:', error);
      });
    }
    
    // Clear local storage
    localStorage.removeItem('google_calendar_token');
    localStorage.removeItem('google_calendar_email');
    
    // Reset state
    setToken(null);
    setUserEmail("");
    setIsConnected(false);
    
    toast({
      title: "Disconnected",
      description: "Your TaskMinder account has been disconnected from Google Calendar.",
    });
    
    setIsSyncing(false);
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_CLIENT_ID_HERE"}>
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
                <span>Connected to {userEmail}</span>
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
            {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
              <span className="block mt-1 text-yellow-300">
                <AlertCircle className="w-3 h-3 inline-block mr-1" />
                Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in your environment.
              </span>
            )}
            {errorMessage && (
              <span className="block mt-1 text-red-300">
                <AlertCircle className="w-3 h-3 inline-block mr-1" />
                {errorMessage}
              </span>
            )}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {!isConnected ? (
              <Button 
                onClick={() => login()}
                disabled={isSyncing || !import.meta.env.VITE_GOOGLE_CLIENT_ID}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : "Connect with Google"}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={syncTasksToCalendar}
                  disabled={isSyncing}
                  variant="outline"
                  className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : "Sync Tasks"}
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

        {/* Multi-app Integration Card */}
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
            <Button 
              variant="outline" 
              className="border-purple-500 text-purple-500 hover:bg-purple-500/10 justify-start"
              onClick={() => {
                toast({
                  title: "Trello integration coming soon",
                  description: "We're working on this integration. Stay tuned for updates!",
                });
              }}
            >
              <img src="https://cdn.worldvectorlogo.com/logos/trello.svg" alt="Trello" className="w-4 h-4 mr-2" />
              Connect to Trello
            </Button>
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-500 hover:bg-blue-500/10 justify-start"
              onClick={() => {
                toast({
                  title: "Asana integration coming soon",
                  description: "We're working on this integration. Stay tuned for updates!",
                });
              }}
            >
              <img src="https://cdn.worldvectorlogo.com/logos/asana-logo.svg" alt="Asana" className="w-4 h-4 mr-2" />
              Connect to Asana
            </Button>
            <Button 
              variant="outline" 
              className="border-green-500 text-green-500 hover:bg-green-500/10 justify-start"
              onClick={() => {
                toast({
                  title: "Todoist integration coming soon",
                  description: "We're working on this integration. Stay tuned for updates!",
                });
              }}
            >
              <img src="https://cdn.worldvectorlogo.com/logos/todoist-2.svg" alt="Todoist" className="w-4 h-4 mr-2" />
              Connect to Todoist
            </Button>
            <Button 
              variant="outline" 
              className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 justify-start"
              onClick={() => {
                toast({
                  title: "Notion integration coming soon",
                  description: "We're working on this integration. Stay tuned for updates!",
                });
              }}
            >
              <img src="https://cdn.worldvectorlogo.com/logos/notion-2.svg" alt="Notion" className="w-4 h-4 mr-2" />
              Connect to Notion
            </Button>
          </div>
        </Card>
      </>
    </GoogleOAuthProvider>
  );
}
