
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Task, TaskTag } from "@/lib/types";
import { TaskCard } from "../TaskCard";

interface ListViewProps {
  tasks: Task[];
  onDragEnd: (result: any) => void;
  onCompleteTask: (id: string) => void;
  currentTimeTracking: string | null;
  onToggleTimeTracking?: (id: string) => void;
  enableTimeTracking: boolean;
  tags: TaskTag[];
}

export function ListView({
  tasks,
  onDragEnd,
  onCompleteTask,
  currentTimeTracking,
  onToggleTimeTracking,
  enableTimeTracking,
  tags
}: ListViewProps) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="tasks">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      task={task}
                      onComplete={onCompleteTask}
                      isTracking={currentTimeTracking === task.id}
                      onToggleTimeTracking={
                        enableTimeTracking ? () => onToggleTimeTracking?.(task.id) : undefined
                      }
                      tags={tags.filter(tag => task.tags?.includes(tag.id))}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
