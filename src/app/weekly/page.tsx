'use client';

import { useState, useMemo } from 'react';
import { useWeeklyPlans } from '@/hooks/useWeeklyPlans';
import { useGoals } from '@/hooks/useGoals';
import { useTodos } from '@/hooks/useTodos';
import WeeklyPlanCard from '@/components/weekly/WeeklyPlanCard';
import TodoBoard from '@/components/todos/TodoBoard';
import TodoForm from '@/components/todos/TodoForm';
import WeeklyCalendar from '@/components/weekly/WeeklyCalendar';
import WeeklyProgress from '@/components/weekly/WeeklyProgress';
import { getWeekStart, formatDate } from '@/lib/utils';
import { addDays, addWeeks, subWeeks, format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function WeeklyPage() {
  const { goals } = useGoals();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart());

  const { plans, loading, error, createPlan, updatePlan, deletePlan } = useWeeklyPlans(currentWeekStart);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { todos, createTodo, updateTodo, deleteTodo } = useTodos(selectedPlanId ?? undefined);

  const [showModal, setShowModal] = useState(false);
  const [modalWeekStart, setModalWeekStart] = useState(formatDate(currentWeekStart));
  const [modalGoals, setModalGoals] = useState<string[]>(['']);
  const [modalMemo, setModalMemo] = useState('');
  const [modalGoalId, setModalGoalId] = useState('');
  const [view, setView] = useState<'board' | 'calendar'>('board');

  const weekEnd = useMemo(() => addDays(currentWeekStart, 6), [currentWeekStart]);
  const weekLabel = `${format(currentWeekStart, 'M/d (EEE)', { locale: ko })} ~ ${format(weekEnd, 'M/d (EEE)', { locale: ko })}`;

  const handlePrevWeek = () => {
    setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    setSelectedPlanId(null);
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    setSelectedPlanId(null);
  };

  const handleToday = () => {
    setCurrentWeekStart(getWeekStart());
    setSelectedPlanId(null);
  };

  const openModal = () => {
    setModalWeekStart(formatDate(currentWeekStart));
    setModalGoals(['']);
    setModalMemo('');
    setModalGoalId('');
    setShowModal(true);
  };

  const handleAddGoal = () => {
    if (modalGoals.length >= 5) return;
    setModalGoals([...modalGoals, '']);
  };

  const handleRemoveGoal = (index: number) => {
    if (modalGoals.length <= 1) return;
    setModalGoals(modalGoals.filter((_, i) => i !== index));
  };

  const handleGoalChange = (index: number, value: string) => {
    const updated = [...modalGoals];
    updated[index] = value;
    setModalGoals(updated);
  };

  const handleCreatePlan = async () => {
    const validGoals = modalGoals.filter((g) => g.trim());
    if (validGoals.length === 0) return;

    await createPlan({
      weekStart: modalWeekStart,
      goals: validGoals.map((title) => ({ title })),
      yearlyGoalId: modalGoalId || undefined,
      memo: modalMemo.trim() || undefined,
    });
    setShowModal(false);
  };

  return (
    <div className="px-6 py-8 md:px-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[22px] font-bold">주간 계획</h1>
        <button
          onClick={openModal}
          className="px-5 py-2.5 bg-rausch text-white rounded-[8px] hover:bg-rausch-active text-sm font-medium transition-colors"
        >
          + 새 주간 계획
        </button>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center gap-3 mb-8 bg-background rounded-[14px] border border-hairline p-3">
        <button onClick={handlePrevWeek} className="px-3 py-1.5 border border-hairline rounded-[8px] hover:bg-surface-soft text-sm transition-colors">
          ◀ 이전
        </button>
        <button onClick={handleToday} className="px-3 py-1.5 border border-hairline rounded-[8px] hover:bg-surface-soft text-sm transition-colors">
          이번 주
        </button>
        <button onClick={handleNextWeek} className="px-3 py-1.5 border border-hairline rounded-[8px] hover:bg-surface-soft text-sm transition-colors">
          다음 ▶
        </button>
        <span className="text-sm font-medium text-body ml-2">{weekLabel}</span>
      </div>

      {loading && <p className="text-muted">로딩 중...</p>}
      {error && <p className="text-[var(--error)]">{error}</p>}

      {!loading && plans.length === 0 && (
        <p className="text-muted text-center py-8">
          이 주의 계획이 없습니다. &quot;새 주간 계획&quot; 버튼을 눌러 계획을 만들어보세요!
        </p>
      )}

      {/* Plan List */}
      <div className="space-y-3 mb-section">
        {plans.map((plan) => (
          <WeeklyPlanCard
            key={plan._id}
            plan={plan}
            goals={goals}
            onUpdate={updatePlan}
            onDelete={deletePlan}
            isSelected={selectedPlanId === plan._id}
            onSelect={setSelectedPlanId}
          />
        ))}
      </div>

      {/* Todos Section */}
      {selectedPlanId && (
        <div>
          <div className="mb-6">
            <WeeklyProgress todos={todos} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">할일</h2>
            <div className="flex gap-0.5 bg-surface-soft rounded-full p-1">
              <button
                onClick={() => setView('board')}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${view === 'board' ? 'bg-background shadow-card font-medium' : 'text-muted'}`}
              >
                칸반
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${view === 'calendar' ? 'bg-background shadow-card font-medium' : 'text-muted'}`}
              >
                요일별
              </button>
            </div>
          </div>

          <div className="mb-6">
            <TodoForm weeklyPlanId={selectedPlanId} onSubmit={createTodo} />
          </div>

          {view === 'board' ? (
            <TodoBoard todos={todos} onUpdate={updateTodo} onDelete={deleteTodo} />
          ) : (
            <WeeklyCalendar todos={todos} onUpdate={updateTodo} onDelete={deleteTodo} />
          )}
        </div>
      )}

      {/* Create Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-[14px] shadow-card w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-6">새 주간 계획</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-body mb-1.5">주간 시작일</label>
                <input
                  type="date"
                  value={modalWeekStart}
                  onChange={(e) => setModalWeekStart(e.target.value)}
                  className="w-full px-3 py-2.5 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-body mb-1.5">1년 목표 연결 (선택)</label>
                <select
                  value={modalGoalId}
                  onChange={(e) => setModalGoalId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none transition-colors"
                >
                  <option value="">연결 안 함</option>
                  {goals.map((g) => (
                    <option key={g._id} value={g._id}>{g.title}</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-body mb-1.5">이번 주 목표 (최대 5개)</label>
                <div className="space-y-2">
                  {modalGoals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={goal}
                        onChange={(e) => handleGoalChange(index, e.target.value)}
                        placeholder={`목표 ${index + 1}`}
                        className="flex-1 px-3 py-2.5 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none transition-colors"
                      />
                      {modalGoals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(index)}
                          className="px-3 py-1 text-[var(--error)] hover:bg-red-50 dark:hover:bg-red-900/10 rounded-[8px] text-sm transition-colors"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {modalGoals.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="mt-2 text-sm text-rausch hover:underline"
                  >
                    + 목표 추가
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-body mb-1.5">메모</label>
                <textarea
                  value={modalMemo}
                  onChange={(e) => setModalMemo(e.target.value)}
                  placeholder="이번 주에 대한 메모..."
                  className="w-full px-3 py-2.5 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none h-20 resize-none transition-colors"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-ink rounded-[8px] text-sm hover:bg-surface-soft font-medium transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleCreatePlan}
                  disabled={modalGoals.every((g) => !g.trim())}
                  className="px-5 py-2.5 bg-rausch text-white rounded-[8px] text-sm hover:bg-rausch-active disabled:bg-rausch-disabled disabled:text-white font-medium transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
