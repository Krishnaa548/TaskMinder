
import { TaskList } from "@/components/TaskList";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-4">TaskMinder</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay organized and never miss a deadline with our intuitive task
            management system.
          </p>
        </header>
        <main className="max-w-3xl mx-auto">
          <TaskList />
        </main>
      </div>
    </div>
  );
};

export default Index;
