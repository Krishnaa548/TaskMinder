
import { TaskList } from "@/components/TaskList";
import { useEffect, useRef } from "react";

const Index = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const onMouseMove = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        if (cursor) {
          cursor.style.left = e.clientX + "px";
          cursor.style.top = e.clientY + "px";
        }

        // Parallax effect for header
        if (headerRef.current) {
          const { clientX, clientY } = e;
          const { innerWidth, innerHeight } = window;
          const moveX = (clientX - innerWidth / 2) / innerWidth * 20;
          const moveY = (clientY - innerHeight / 2) / innerHeight * 20;
          headerRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 relative overflow-hidden">
      <div ref={cursorRef} className="cursor-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,50,0.2),transparent_100%)]" />
      <div className="absolute inset-0 opacity-30">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              background: `hsl(${Math.random() * 360}, 50%, 50%)`,
              animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
      <div className="container mx-auto px-4 py-8 relative">
        <header ref={headerRef} className="text-center mb-12 transition-transform duration-300 ease-out">
          <div className="floating inline-block">
            <h1 className="text-4xl font-bold mb-4 rainbow-text">TaskMinder</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto opacity-90 backdrop-blur-sm">
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
