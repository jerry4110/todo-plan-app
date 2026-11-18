'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Todo, TodoStatus } from '@/types';
import TodoCard from './TodoCard';

interface TodoColumnProps {
  status: TodoStatus;
  todos: Todo[];
  onUpdate: (id: string, data: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_CONFIG: Record<TodoStatus, { label: string; color: string }> = {
  todo: { label: '할 일', color: 'bg-surface-soft' },
  doing: { label: '진행 중', color: 'bg-red-50/50 dark:bg-red-900/5' },
  done: { label: '완료', color: 'bg-emerald-50/50 dark:bg-emerald-900/5' },
};

export default function TodoColumn({ status, todos, onUpdate, onDelete }: TodoColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = STATUS_CONFIG[status];

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 ${config.color} rounded-[14px] p-3 min-h-[200px] transition-all ${
        isOver ? 'ring-2 ring-rausch/40' : ''
      }`}
    >
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        {config.label}
        <span className="text-xs bg-background px-2 py-0.5 rounded-full text-muted">{todos.length}</span>
      </h3>
      <SortableContext items={todos.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {todos.map((todo) => (
            <TodoCard key={todo._id} todo={todo} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
