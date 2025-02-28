
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TaskAnalytics } from "@/lib/types";
import { GoogleCalendarIntegration } from "../GoogleCalendarIntegration";
import { Task } from "@/lib/types";

interface TaskAnalyticsDashboardProps {
  analytics: TaskAnalytics;
  chartData: Array<{ name: string; tasks: number }>;
  tasks: Task[];
}

export function TaskAnalyticsDashboard({
  analytics,
  chartData,
  tasks
}: TaskAnalyticsDashboardProps) {
  return (
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
  );
}
