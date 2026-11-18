'use client';

import { useState, useEffect } from 'react';
import type { WeeklyPlan } from '@/types';

interface GoalProgressProps {
  goalId: string;
}

export default function GoalProgress({ goalId }: GoalProgressProps) {
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const plansRes = await fetch(`/api/weekly-plans?yearlyGoalId=${goalId}`);
        if (!plansRes.ok) return;
        const plans: WeeklyPlan[] = await plansRes.json();

        if (plans.length === 0) {
          setProgress(0);
          return;
        }

        let totalGoals = 0;
        let completedGoals = 0;

        for (const plan of plans) {
          if (plan.goals && plan.goals.length > 0) {
            totalGoals += plan.goals.length;
            completedGoals += plan.goals.filter((g) => g.completed).length;
          }
        }

        if (totalGoals === 0) {
          setProgress(0);
          return;
        }

        setProgress(Math.round((completedGoals / totalGoals) * 100));
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [goalId]);

  if (loading) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-muted">목표 진행률</span>
        <span className="text-xs font-bold text-rausch">{progress}%</span>
      </div>
      <div className="w-full bg-surface-strong rounded-full h-1.5">
        <div
          className="bg-rausch h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
