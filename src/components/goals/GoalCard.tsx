'use client';

import { useState } from 'react';
import type { YearlyGoal } from '@/types';
import GoalForm from './GoalForm';
import GoalProgress from './GoalProgress';

interface GoalCardProps {
  goal: YearlyGoal;
  onUpdate: (id: string, data: { title: string; description: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (editing) {
    return (
      <GoalForm
        initialData={goal}
        onSubmit={async (data) => {
          await onUpdate(goal._id, data);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="bg-background rounded-[14px] border border-hairline p-5 hover:shadow-card transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{goal.title}</h3>
          {goal.description && (
            <p className="text-body mt-1 text-sm">{goal.description}</p>
          )}
        </div>
        <div className="flex gap-1 ml-4">
          <button
            onClick={() => setEditing(true)}
            className="px-2.5 py-1 text-sm text-rausch hover:bg-red-50 dark:hover:bg-red-900/10 rounded-[8px] transition-colors"
          >
            수정
          </button>
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                onClick={async () => {
                  await onDelete(goal._id);
                  setConfirmDelete(false);
                }}
                className="px-2.5 py-1 text-sm text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-900/10 rounded-[8px] font-medium transition-colors"
              >
                확인
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 text-sm text-muted hover:bg-surface-soft rounded-[8px] transition-colors"
              >
                취소
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-2.5 py-1 text-sm text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-900/10 rounded-[8px] transition-colors"
            >
              삭제
            </button>
          )}
        </div>
      </div>
      <GoalProgress goalId={goal._id} />
    </div>
  );
}
