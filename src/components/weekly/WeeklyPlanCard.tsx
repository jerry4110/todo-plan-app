'use client';

import { useState } from 'react';
import type { WeeklyPlan, YearlyGoal, UpdateWeeklyPlanInput, WeeklyGoal as WeeklyGoalType } from '@/types';
import { addDays, format } from 'date-fns';
import WeeklyMemo from './WeeklyMemo';
import WeeklyRetrospective from './WeeklyRetrospective';

type PopulatedPlan = Omit<WeeklyPlan, 'yearlyGoalId'> & {
  yearlyGoalId?: string | YearlyGoal | null;
};

interface WeeklyPlanCardProps {
  plan: PopulatedPlan;
  goals: YearlyGoal[];
  onUpdate: (id: string, data: UpdateWeeklyPlanInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function WeeklyPlanCard({
  plan,
  goals,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
}: WeeklyPlanCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const goalName =
    typeof plan.yearlyGoalId === 'object' && plan.yearlyGoalId
      ? plan.yearlyGoalId.title
      : goals.find((g) => g._id === plan.yearlyGoalId)?.title ?? '';

  const weekStart = new Date(plan.weekStart);
  const weekEnd = addDays(weekStart, 6);
  const dateLabel = `${format(weekStart, 'M/d')} ~ ${format(weekEnd, 'M/d')}`;

  const completedGoals = plan.goals?.filter((g) => g.completed).length ?? 0;
  const totalGoals = plan.goals?.length ?? 0;
  const progressPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const handleGoalToggle = async (goalToToggle: WeeklyGoalType) => {
    if (!plan.goals) return;
    const updatedGoals = plan.goals.map((g) =>
      g._id === goalToToggle._id ? { ...g, completed: !g.completed } : g
    );
    await onUpdate(plan._id, { goals: updatedGoals });
  };

  return (
    <div
      className={`bg-background rounded-[14px] border-2 p-5 cursor-pointer transition-all ${
        isSelected
          ? 'border-rausch shadow-card'
          : 'border-transparent hover:shadow-card'
      }`}
      onClick={() => onSelect(plan._id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-sm font-medium text-muted">{dateLabel}</span>
            {goalName && (
              <span className="text-xs text-rausch bg-red-50 dark:bg-red-900/10 px-2 py-0.5 rounded-full font-medium">
                {goalName}
              </span>
            )}
          </div>
          {totalGoals > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-surface-strong rounded-full h-1.5">
                <div
                  className="bg-rausch h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs text-muted whitespace-nowrap">
                {completedGoals}/{totalGoals}
              </span>
            </div>
          )}
          <ul className="space-y-1.5">
            {plan.goals?.map((goal) => (
              <li
                key={goal._id}
                className="flex items-center gap-2.5 text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => handleGoalToggle(goal)}
                  className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[10px] flex-shrink-0 transition-colors ${
                    goal.completed
                      ? 'bg-rausch border-rausch text-white'
                      : 'border-hairline hover:border-rausch'
                  }`}
                >
                  {goal.completed && '✓'}
                </button>
                <span className={goal.completed ? 'line-through text-muted-soft' : 'text-body'}>
                  {goal.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
          {confirmDelete ? (
            <>
              <button onClick={() => { onDelete(plan._id); setConfirmDelete(false); }} className="px-2.5 py-1 text-sm text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-900/10 rounded-[8px] font-medium transition-colors">확인</button>
              <button onClick={() => setConfirmDelete(false)} className="px-2.5 py-1 text-sm text-muted hover:bg-surface-soft rounded-[8px] transition-colors">취소</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="px-2.5 py-1 text-sm text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-900/10 rounded-[8px] transition-colors">삭제</button>
          )}
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-hairline-soft space-y-4" onClick={(e) => e.stopPropagation()}>
          <WeeklyMemo
            value={plan.memo}
            onSave={(memo) => onUpdate(plan._id, { memo })}
          />
          <WeeklyRetrospective
            value={plan.retrospective}
            onSave={(retrospective) => onUpdate(plan._id, { retrospective })}
          />
        </div>
      )}
    </div>
  );
}
