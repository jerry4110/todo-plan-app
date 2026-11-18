'use client';

import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Todo } from '@/types';
import { DAY_LABELS } from '@/lib/utils';
import TodoCard from '../todos/TodoCard';

interface DayColumnProps {
  dayIndex: number;
  todos: Todo[];
  onUpdate: (id: string, data: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function DayColumn({ dayIndex, todos, onUpdate, onDelete }: DayColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dayIndex}` });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[120px] bg-surface-soft rounded-[14px] p-2 min-h-[150px] transition-all ${
        isOver ? 'ring-2 ring-rausch/40' : ''
      }`}
    >
      <h4 className="text-xs font-semibold text-center mb-2 text-muted">
        {DAY_LABELS[dayIndex]}
        <span className="ml-1 text-muted-soft">({todos.length})</span>
      </h4>
      <SortableContext items={todos.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5">
          {todos.map((todo) => (
            <TodoCard key={todo._id} todo={todo} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

interface WeeklyCalendarProps {
  todos: Todo[];
  onUpdate: (id: string, data: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function WeeklyCalendar({ todos, onUpdate, onDelete }: WeeklyCalendarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const todosByDay = (day: number) => todos.filter((t) => t.dayOfWeek === day);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const todoId = active.id as string;
    const overId = over.id as string;

    if (overId.startsWith('day-')) {
      const newDay = parseInt(overId.replace('day-', ''), 10);
      const todo = todos.find((t) => t._id === todoId);
      if (todo && todo.dayOfWeek !== newDay) {
        await onUpdate(todoId, { dayOfWeek: newDay });
      }
      return;
    }

    const targetTodo = todos.find((t) => t._id === overId);
    if (targetTodo) {
      const draggedTodo = todos.find((t) => t._id === todoId);
      if (draggedTodo && draggedTodo.dayOfWeek !== targetTodo.dayOfWeek) {
        await onUpdate(todoId, { dayOfWeek: targetTodo.dayOfWeek });
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-2 overflow-x-auto">
        {DAY_LABELS.map((_, i) => (
          <DayColumn
            key={i}
            dayIndex={i}
            todos={todosByDay(i)}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}
