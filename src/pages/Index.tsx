
import { TaskList } from "@/components/TaskList";
import { useEffect, useRef } from "react";

const Index = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        if (cursor) {
          cursor.style.left = e.clientX + "px";
          cursor.style.top = e.clientY + "px";
        }
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from
-black to-gray-900 relative overflow-hidden">
      <div ref={cursorRef} className="cursor-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,50,0.2),transparent_100%)]" />
      <div className="container mx-auto px-4 py-8 relative">
        <header className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold mb-4 rainbow-text">TaskMinder</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
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
