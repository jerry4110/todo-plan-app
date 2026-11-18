'use client';

import { useWeeklyPlans } from '@/hooks/useWeeklyPlans';
import { useGoals } from '@/hooks/useGoals';
import { useState, useEffect } from 'react';
import { getWeekStart, getWeekEnd } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Todo } from '@/types';
import GoalCard from '@/components/goals/GoalCard';

export default function DashboardPage() {
  const { plans, loading: plansLoading } = useWeeklyPlans();
  const { goals, loading: goalsLoading, updateGoal, deleteGoal } = useGoals();
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);

  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  const weekLabel = `${format(weekStart, 'M/d', { locale: ko })} (${format(weekStart, 'EEE', { locale: ko })}) ~ ${format(weekEnd, 'M/d', { locale: ko })} (${format(weekEnd, 'EEE', { locale: ko })})`;

  useEffect(() => {
    const fetchAllTodos = async () => {
      setTodosLoading(true);
      try {
        const res = await fetch('/api/todos');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setAllTodos(data);
      } finally {
        setTodosLoading(false);
      }
    };
    fetchAllTodos();
  }, []);

  const totalTodos = allTodos.length;
  const doneTodos = allTodos.filter((t) => t.status === 'done').length;
  const loading = plansLoading || goalsLoading || todosLoading;

  return (
    <div className="px-6 py-8 md:px-10 max-w-5xl mx-auto">
      <h1 className="text-[22px] font-bold mb-8">대시보드</h1>

      {loading && <p className="text-muted">로딩 중...</p>}

      {!loading && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-section">
            {[
              { label: '이번 주 계획', value: `${plans.length}개` },
              {
                label: '전체 할일 진행',
                value: (
                  <>
                    {doneTodos} / {totalTodos}
                    {totalTodos > 0 && (
                      <span className="text-sm text-muted ml-2">
                        ({Math.round((doneTodos / totalTodos) * 100)}%)
                      </span>
                    )}
                  </>
                ),
              },
              { label: '1년 목표', value: `${goals.length}개` },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-background rounded-[14px] border border-hairline p-5 hover:shadow-card transition-shadow"
              >
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* This Week's Plans */}
          <section className="mb-section">
            <h2 className="text-lg font-semibold mb-4">이번 주 계획 ({weekLabel})</h2>
            {plans.length === 0 ? (
              <p className="text-muted text-sm bg-surface-soft rounded-[14px] p-5">
                이번 주 계획이 없습니다. 주간 계획 페이지에서 새 계획을 만들어보세요.
              </p>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => {
                  const completedGoals = plan.goals.filter((g) => g.completed).length;
                  const totalGoals = plan.goals.length;
                  const progressPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
                  const planWeekStart = new Date(plan.weekStart);
                  const planWeekEnd = addDays(planWeekStart, 6);
                  const dateLabel = `${format(planWeekStart, 'M/d')} ~ ${format(planWeekEnd, 'M/d')}`;

                  return (
                    <div key={plan._id} className="bg-background rounded-[14px] border border-hairline p-5 hover:shadow-card transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted">{dateLabel}</span>
                        <span className="text-xs font-semibold text-rausch">
                          {completedGoals}/{totalGoals} 완료
                        </span>
                      </div>
                      {totalGoals > 0 && (
                        <div className="w-full bg-surface-strong rounded-full h-1.5 mb-3">
                          <div
                            className="bg-rausch h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      )}
                      <ul className="space-y-2">
                        {plan.goals.map((goal) => (
                          <li key={goal._id} className="flex items-center gap-2.5 text-sm">
                            <span className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center text-[10px] ${
                              goal.completed
                                ? 'bg-rausch border-rausch text-white'
                                : 'border-hairline'
                            }`}>
                              {goal.completed && '✓'}
                            </span>
                            <span className={goal.completed ? 'line-through text-muted-soft' : 'text-body'}>
                              {goal.title}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {plan.memo && (
                        <p className="text-xs text-muted mt-3 pt-3 border-t border-hairline-soft">{plan.memo}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Yearly Goals */}
          <section>
            <h2 className="text-lg font-semibold mb-4">1년 목표</h2>
            {goals.length === 0 ? (
              <p className="text-muted text-sm bg-surface-soft rounded-[14px] p-5">
                1년 목표가 없습니다. 목표 페이지에서 새 목표를 추가해보세요.
              </p>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal._id}
                    goal={goal}
                    onUpdate={updateGoal}
                    onDelete={deleteGoal}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
