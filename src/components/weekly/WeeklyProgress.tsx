'use client';

import type { Todo } from '@/types';

interface WeeklyProgressProps {
  todos: Todo[];
}

export default function WeeklyProgress({ todos }: WeeklyProgressProps) {
  const total = todos.length;
  const done = todos.filter((t) => t.status === 'done').length;
  const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="bg-background rounded-[14px] border border-hairline p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-body">주간 진행률</span>
        <span className="text-sm font-bold text-rausch">{percentage}%</span>
      </div>
      <div className="w-full bg-surface-strong rounded-full h-1.5">
        <div
          className="bg-rausch h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-muted mt-1.5">{done} / {total} 완료</p>
    </div>
  );
}
