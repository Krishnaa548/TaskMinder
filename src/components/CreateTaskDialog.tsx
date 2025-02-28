
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TaskPriority, TaskTag } from "@/lib/types";
import { useState } from "react";
import { PlusCircle, Wand2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface CreateTaskDialogProps {
  onCreateTask: (task: {
    title: string;
    description: string;
    dueDate: Date;
    priority: TaskPriority;
    tags?: string[];
    recurrence?: {
      frequency: "daily" | "weekly" | "monthly" | "yearly";
      interval: number;
      endDate?: Date;
      count?: number;
    };
  }) => void;
  enableNaturalLanguage?: boolean;
  defaultPriority?: TaskPriority;
  tags?: TaskTag[];
}

export function CreateTaskDialog({ 
  onCreateTask, 
  enableNaturalLanguage = false,
  defaultPriority = "medium",
  tags = []
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(defaultPriority);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [useNaturalLanguage, setUseNaturalLanguage] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  
  const { toast } = useToast();

  const parseNaturalLanguage = () => {
    // This is a simplified mock implementation
    // In a real app, you would use a more sophisticated NLP library
    
    // Example: "Meeting with John tomorrow at 3pm"
    const input = naturalLanguageInput.toLowerCase();
    let parsedTitle = "";
    let parsedDate = new Date();
    let parsedPriority: TaskPriority = defaultPriority;
    
    // Extract title (simplified)
    parsedTitle = input.replace(/tomorrow|next week|at \d+(?:am|pm)/g, "").trim();
    
    // Extract date (simplified)
    if (input.includes("tomorrow")) {
      parsedDate.setDate(parsedDate.getDate() + 1);
    } else if (input.includes("next week")) {
      parsedDate.setDate(parsedDate.getDate() + 7);
    }
    
    // Extract time (simplified)
    const timeMatch = input.match(/at (\d+)(?:(am|pm))?/);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1]);
      const period = timeMatch[2];
      
      if (period === "pm" && hours < 12) {
        hours += 12;
      }
      
      parsedDate.setHours(hours, 0, 0, 0);
    }
    
    // Extract priority (simplified)
    if (input.includes("urgent") || input.includes("important")) {
      parsedPriority = "high";
    } else if (input.includes("low priority") || input.includes("when you can")) {
      parsedPriority = "low";
    }
    
    setTitle(parsedTitle);
    setDueDate(parsedDate.toISOString().slice(0, 16));
    setPriority(parsedPriority);
    
    toast({
      title: "Natural Language Parsed",
      description: "We've interpreted your input. Feel free to adjust the details.",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask = {
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      recurrence: isRecurring ? {
        frequency: recurrenceFrequency,
        interval: recurrenceInterval,
      } : undefined,
    };
    
    onCreateTask(newTask);
    setOpen(false);
    
    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority(defaultPriority);
    setSelectedTags([]);
    setNaturalLanguageInput("");
    setUseNaturalLanguage(false);
    setIsRecurring(false);
    setRecurrenceFrequency("weekly");
    setRecurrenceInterval(1);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rainbow-border bg-black/50 hover:bg-black/70 transition-all duration-300">
          <PlusCircle className="w-5 h-5" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="rainbow-text">Create New Task</DialogTitle>
        </DialogHeader>
        
        {enableNaturalLanguage && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Switch 
                id="use-natural-language"
                checked={useNaturalLanguage}
                onCheckedChange={setUseNaturalLanguage}
              />
              <Label htmlFor="use-natural-language" className="text-white/90">Use Natural Language Input</Label>
            </div>
            
            {useNaturalLanguage && (
              <div className="space-y-2">
                <Label htmlFor="natural-language" className="text-white/90">Describe your task</Label>
                <div className="flex gap-2">
                  <Input
                    id="natural-language"
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    placeholder="e.g. Meeting with John tomorrow at 3pm"
                    className="bg-white/10 border-white/20 text-white flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={parseNaturalLanguage}
                    className="gap-1"
                  >
                    <Wand2 className="w-4 h-4" />
                    Parse
                  </Button>
                </div>
                <p className="text-xs text-gray-400">
                  Try phrases like "Meeting tomorrow at 2pm" or "Submit report next week"
                </p>
              </div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white/90">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white/90">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-white/90">Due Date</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-white/90">Priority</Label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full p-2 rounded bg-white/10 border border-white/20 text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          {tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white/90">Tags</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <div
                    key={tag.id}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag.id) 
                          ? prev.filter(id => id !== tag.id) 
                          : [...prev, tag.id]
                      );
                    }}
                    style={{ 
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : `${tag.color}20`,
                      color: selectedTags.includes(tag.id) ? 'white' : tag.color
                    }}
                    className="px-2 py-1 rounded-full text-xs cursor-pointer transition-colors duration-200 flex items-center"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag.name}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="recurring-task"
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
              />
              <Label htmlFor="recurring-task" className="text-white/90">Recurring Task</Label>
            </div>
            
            {isRecurring && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <Label htmlFor="recurrence-frequency" className="text-white/90 text-sm">Frequency</Label>
                  <select
                    id="recurrence-frequency"
                    value={recurrenceFrequency}
                    onChange={(e) => setRecurrenceFrequency(e.target.value as "daily" | "weekly" | "monthly" | "yearly")}
                    className="w-full p-2 rounded bg-white/10 border border-white/20 text-white text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="recurrence-interval" className="text-white/90 text-sm">Every</Label>
                  <div className="flex items-center">
                    <Input
                      id="recurrence-interval"
                      type="number"
                      min="1"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(parseInt(e.target.value))}
                      className="bg-white/10 border-white/20 text-white text-sm"
                    />
                    <span className="ml-2 text-white/90 text-sm">
                      {recurrenceFrequency === "daily" && (recurrenceInterval === 1 ? "day" : "days")}
                      {recurrenceFrequency === "weekly" && (recurrenceInterval === 1 ? "week" : "weeks")}
                      {recurrenceFrequency === "monthly" && (recurrenceInterval === 1 ? "month" : "months")}
                      {recurrenceFrequency === "yearly" && (recurrenceInterval === 1 ? "year" : "years")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full rainbow-border bg-black/50 hover:bg-black/70 transition-all duration-300">
            Create Task
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
