
import { useEffect, useRef } from 'react';
import { usePreferenceStore } from '@/stores/preferenceStore';

type BackgroundTheme = 'rainbow' | 'particles' | 'waves' | 'minimal';

export function BackgroundEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const { backgroundTheme } = usePreferenceStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full screen
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Rainbow particles
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
    }> = [];

    // Create particles based on theme
    const createParticles = () => {
      particles.length = 0; // Clear existing particles
      
      const particleCount = backgroundTheme === 'minimal' ? 30 : 
                           backgroundTheme === 'particles' ? 150 : 70;
      
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * 5 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const speedX = (Math.random() - 0.5) * 1;
        const speedY = (Math.random() - 0.5) * 1;
        
        // Color based on theme
        let color;
        if (backgroundTheme === 'rainbow') {
          color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        } else if (backgroundTheme === 'waves') {
          color = `hsl(200, 70%, ${Math.random() * 30 + 40}%)`;
        } else if (backgroundTheme === 'minimal') {
          color = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`;
        } else {
          // particles theme
          color = `hsl(${Math.random() * 60 + 200}, 70%, 60%)`;
        }
        
        particles.push({
          x,
          y,
          size,
          speedX,
          speedY,
          color,
          alpha: Math.random() * 0.5 + 0.1
        });
      }
    };

    createParticles();

    // Rainbow gradient effect
    let gradientOffset = 0;

    const drawRainbowGradient = () => {
      if (backgroundTheme !== 'rainbow') return;
      
      gradientOffset += 0.5;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      const offset1 = (gradientOffset % 360) / 360;
      const offset2 = ((gradientOffset + 60) % 360) / 360;
      const offset3 = ((gradientOffset + 120) % 360) / 360;
      const offset4 = ((gradientOffset + 180) % 360) / 360;
      const offset5 = ((gradientOffset + 240) % 360) / 360;
      const offset6 = ((gradientOffset + 300) % 360) / 360;
      
      gradient.addColorStop(offset1, 'rgba(255, 0, 0, 0.1)');
      gradient.addColorStop(offset2, 'rgba(255, 165, 0, 0.1)');
      gradient.addColorStop(offset3, 'rgba(255, 255, 0, 0.1)');
      gradient.addColorStop(offset4, 'rgba(0, 128, 0, 0.1)');
      gradient.addColorStop(offset5, 'rgba(0, 0, 255, 0.1)');
      gradient.addColorStop(offset6, 'rgba(128, 0, 128, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Wave effect
    let waveOffset = 0;
    
    const drawWaves = () => {
      if (backgroundTheme !== 'waves') return;
      
      waveOffset += 0.01;
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.1)';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const amplitude = 20 + i * 15;
        const frequency = 0.005 + i * 0.002;
        
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + 
                   Math.sin(x * frequency + waveOffset + i) * amplitude +
                   i * 50;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add background effects based on theme
      if (backgroundTheme === 'rainbow') {
        drawRainbowGradient();
      } else if (backgroundTheme === 'waves') {
        drawWaves();
      }
      
      // Draw and update particles
      particles.forEach(particle => {
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });
      
      ctx.globalAlpha = 1;
      
      // Add subtle connection lines between close particles
      if (backgroundTheme === 'particles' || backgroundTheme === 'rainbow') {
        ctx.strokeStyle = backgroundTheme === 'rainbow' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(100, 150, 255, 0.05)';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Recreate particles when theme changes
    createParticles();

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [backgroundTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[-1] pointer-events-none"
      style={{ opacity: 0.8 }}
    />
  );
}
