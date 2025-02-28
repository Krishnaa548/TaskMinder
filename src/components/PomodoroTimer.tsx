
import { useState, useEffect, useRef } from 'react';
import { usePreferenceStore } from '@/stores/preferenceStore';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PomodoroTimer() {
  const { focusMode } = usePreferenceStore();
  const [timeLeft, setTimeLeft] = useState(focusMode.pomodoroDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Format seconds into mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start/stop timer
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(focusMode.pomodoroDuration * 60);
  };

  // Toggle between focus and break
  const toggleMode = () => {
    setIsActive(false);
    if (isBreak) {
      setIsBreak(false);
      setTimeLeft(focusMode.pomodoroDuration * 60);
      toast({
        title: "Pomodoro Started",
        description: "Time to focus!",
      });
    } else {
      setIsBreak(true);
      setTimeLeft(focusMode.breakDuration * 60);
      toast({
        title: "Break Time",
        description: "Take a short break!",
      });
    }
  };

  // Timer effect
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            
            // Play notification sound
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
            audio.play();
            
            // Show notification
            toast({
              title: isBreak ? "Break Finished" : "Pomodoro Finished",
              description: isBreak ? "Ready to get back to work?" : "Time for a break!",
              duration: 5000,
            });
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isBreak, toast]);

  // Update timer when settings change
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(isBreak ? focusMode.breakDuration * 60 : focusMode.pomodoroDuration * 60);
    }
  }, [focusMode.pomodoroDuration, focusMode.breakDuration, isBreak, isActive]);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="glass-card p-4 mb-6 pomodoro-timer">
      <h3 className="text-lg font-semibold mb-2">{isBreak ? 'Break Time' : 'Focus Time'}</h3>
      <div className="timer-display rainbow-text">{formatTime(timeLeft)}</div>
      <div className="timer-label">{isBreak ? 'Relax and recharge' : 'Stay focused'}</div>
      
      <div className="flex justify-center space-x-2 mt-4">
        <Button 
          onClick={toggleTimer} 
          variant="outline" 
          size="sm"
          className={isActive ? 'bg-red-500/20' : 'bg-green-500/20'}
        >
          {isActive ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        
        <Button onClick={resetTimer} variant="outline" size="sm">
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
        
        <Button onClick={toggleMode} variant="outline" size="sm">
          {isBreak ? <Play className="w-4 h-4 mr-1" /> : <Coffee className="w-4 h-4 mr-1" />}
          {isBreak ? 'Focus' : 'Break'}
        </Button>
      </div>
    </div>
  );
}
