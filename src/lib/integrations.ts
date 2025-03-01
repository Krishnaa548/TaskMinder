
// Google Calendar Integration Types
export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  reminders?: {
    useDefault: boolean;
  };
}

export interface TaskSyncResult {
  success: boolean;
  taskId: string;
  eventId?: string;
  error?: string;
}

// Generic Integration Types
export interface IntegrationStatus {
  isConnected: boolean;
  accountInfo?: string;
  lastSynced?: Date;
  error?: string;
}

export interface IntegrationConfig {
  clientId?: string;
  apiKey?: string;
  scopes?: string[];
  redirectUri?: string;
}

// Multi-App Integration Types
export interface ExternalTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date | string;
  status?: string;
  url?: string;
  source: 'trello' | 'asana' | 'todoist' | 'notion' | 'google';
}

// Utility functions for working with calendar integrations
export function formatDateForCalendar(date: Date): string {
  return date.toISOString();
}

export function getDefaultTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
