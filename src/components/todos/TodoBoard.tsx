'use client';

import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Todo, TodoStatus } from '@/types';
import TodoColumn from './TodoColumn';

interface TodoBoardProps {
  todos: Todo[];
  onUpdate: (id: string, data: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUSES: TodoStatus[] = ['todo', 'doing', 'done'];

export default function TodoBoard({ todos, onUpdate, onDelete }: TodoBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const todosByStatus = (status: TodoStatus) =>
    todos.filter((t) => t.status === status);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const todoId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column (status)
    if (STATUSES.includes(overId as TodoStatus)) {
      const todo = todos.find((t) => t._id === todoId);
      if (todo && todo.status !== overId) {
        await onUpdate(todoId, { status: overId as TodoStatus });
      }
      return;
    }

    // Dropped on another todo card — move to that card's status
    const targetTodo = todos.find((t) => t._id === overId);
    if (targetTodo) {
      const draggedTodo = todos.find((t) => t._id === todoId);
      if (draggedTodo && draggedTodo.status !== targetTodo.status) {
        await onUpdate(todoId, { status: targetTodo.status });
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex gap-4">
        {STATUSES.map((status) => (
          <TodoColumn
            key={status}
            status={status}
            todos={todosByStatus(status)}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}
