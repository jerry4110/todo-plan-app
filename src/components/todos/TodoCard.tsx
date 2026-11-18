'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo } from '@/types';
import { getDayLabel } from '@/lib/utils';

interface TodoCardProps {
  todo: Todo;
  onUpdate: (id: string, data: Partial<Todo>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TodoCard({ todo, onUpdate, onDelete }: TodoCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description ?? '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  };

  const handleSave = async () => {
    await onUpdate(todo._id, { title, description: description || undefined });
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-background rounded-[14px] border border-hairline border-l-4 ${priorityColors[todo.priority]} p-3 ${
        isDragging ? 'shadow-card' : 'hover:shadow-card'
      } transition-shadow`}
    >
      <div className="flex items-start gap-2">
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-soft mt-0.5 select-none"
        >
          ⠿
        </span>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2 py-1 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설명"
                className="w-full px-2 py-1 border border-hairline rounded-[8px] text-sm bg-background min-h-[40px] focus:border-ink focus:ring-0 focus:outline-none"
              />
              <div className="flex gap-1.5">
                <button onClick={handleSave} className="px-2.5 py-1 bg-rausch text-white rounded-[8px] text-xs hover:bg-rausch-active transition-colors">저장</button>
                <button onClick={() => setEditing(false)} className="px-2.5 py-1 bg-surface-soft rounded-[8px] text-xs hover:bg-surface-strong transition-colors">취소</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium truncate">{todo.title}</p>
              {todo.description && (
                <p className="text-xs text-muted mt-1 truncate">{todo.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-soft">
                {todo.dayOfWeek !== undefined && <span>{getDayLabel(todo.dayOfWeek)}</span>}
                {todo.dueDate && <span>📅 {new Date(todo.dueDate).toLocaleDateString('ko-KR')}</span>}
              </div>
            </>
          )}
        </div>
        {!editing && (
          <div className="flex gap-1">
            <button onClick={() => setEditing(true)} className="text-muted-soft hover:text-rausch text-xs transition-colors">✏️</button>
            <button onClick={() => onDelete(todo._id)} className="text-muted-soft hover:text-[var(--error)] text-xs transition-colors">🗑️</button>
          </div>
        )}
      </div>
    </div>
  );
}
