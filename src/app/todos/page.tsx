'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import TodoForm from '@/components/todos/TodoForm';
import type { Todo, TodoStatus } from '@/types';

const STATUS_LABELS: Record<TodoStatus, string> = {
  todo: '예정',
  doing: '진행 중',
  done: '완료',
};

const PRIORITY_COLORS = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};

function TodoItem({
  todo,
  onUpdate,
  onDelete,
}: {
  todo: Todo;
  onUpdate: (data: Partial<Todo>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const nextStatus = (): TodoStatus | null => {
    if (todo.status === 'todo') return 'doing';
    if (todo.status === 'doing') return 'done';
    return null;
  };

  const prevStatus = (): TodoStatus | null => {
    if (todo.status === 'done') return 'doing';
    if (todo.status === 'doing') return 'todo';
    return null;
  };

  const next = nextStatus();
  const prev = prevStatus();

  return (
    <div className={`bg-background rounded-[14px] border border-hairline border-l-4 ${PRIORITY_COLORS[todo.priority]} p-4 hover:shadow-card transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{todo.title}</p>
          {todo.description && (
            <p className="text-xs text-muted mt-1">{todo.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-soft">
            <span className="px-1.5 py-0.5 bg-surface-soft rounded-[8px]">{STATUS_LABELS[todo.status]}</span>
            {todo.dueDate && <span>📅 {new Date(todo.dueDate).toLocaleDateString('ko-KR')}</span>}
            {todo.weeklyGoalId && (
              <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-900/10 text-rausch rounded-[8px]">목표 연동</span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {prev && (
            <button
              onClick={() => onUpdate({ status: prev })}
              className="px-2.5 py-1 text-xs border border-hairline rounded-[8px] hover:bg-surface-soft transition-colors"
              title={STATUS_LABELS[prev]}
            >
              ◀
            </button>
          )}
          {next && (
            <button
              onClick={() => onUpdate({ status: next })}
              className="px-2.5 py-1 text-xs bg-rausch text-white rounded-[8px] hover:bg-rausch-active transition-colors"
              title={STATUS_LABELS[next]}
            >
              {next === 'done' ? '✓ 완료' : '▶ 시작'}
            </button>
          )}
          <button
            onClick={onDelete}
            className="px-2.5 py-1 text-xs text-muted-soft hover:text-[var(--error)] border border-hairline rounded-[8px] hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TodosPage() {
  const { todos, loading, error, createTodo, updateTodo, deleteTodo } = useTodos();
  const [showModal, setShowModal] = useState(false);

  const inProgressTodos = todos.filter((t) => t.status === 'todo' || t.status === 'doing');
  const doneTodos = todos.filter((t) => t.status === 'done');

  if (loading) {
    return (
      <div className="px-6 py-8 md:px-10">
        <h1 className="text-[22px] font-bold mb-8">할 일</h1>
        <div className="text-muted">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-8 md:px-10">
        <h1 className="text-[22px] font-bold mb-8">할 일</h1>
        <div className="text-[var(--error)]">오류: {error}</div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 md:px-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[22px] font-bold">할 일</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-rausch text-white rounded-[8px] hover:bg-rausch-active text-sm font-medium transition-colors"
        >
          + 새 할 일
        </button>
      </div>

      {showModal && (
        <TodoForm
          isModal
          onSubmit={createTodo}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* 진행 중 */}
      <section className="mb-section">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rausch inline-block" />
          진행 중
          <span className="text-sm text-muted-soft font-normal">({inProgressTodos.length})</span>
        </h2>
        {inProgressTodos.length === 0 ? (
          <p className="text-muted text-sm">진행 중인 할 일이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {inProgressTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onUpdate={(data) => updateTodo(todo._id, data)}
                onDelete={() => deleteTodo(todo._id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 완료 */}
      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          완료
          <span className="text-sm text-muted-soft font-normal">({doneTodos.length})</span>
        </h2>
        {doneTodos.length === 0 ? (
          <p className="text-muted text-sm">완료된 할 일이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {doneTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onUpdate={(data) => updateTodo(todo._id, data)}
                onDelete={() => deleteTodo(todo._id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
