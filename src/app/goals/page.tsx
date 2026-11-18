'use client';

import { useGoals } from '@/hooks/useGoals';
import GoalCard from '@/components/goals/GoalCard';
import GoalForm from '@/components/goals/GoalForm';

export default function GoalsPage() {
  const { goals, loading, error, createGoal, updateGoal, deleteGoal } = useGoals();

  return (
    <div className="px-6 py-8 md:px-10 max-w-3xl mx-auto">
      <h1 className="text-[22px] font-bold mb-8">1년 목표</h1>

      <div className="mb-section">
        <GoalForm
          onSubmit={async (data) => {
            await createGoal(data);
          }}
        />
      </div>

      {loading && <p className="text-muted">로딩 중...</p>}
      {error && <p className="text-[var(--error)]">{error}</p>}

      {!loading && goals.length === 0 && (
        <p className="text-muted text-center py-8">
          아직 목표가 없습니다. 첫 번째 목표를 추가해보세요!
        </p>
      )}

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
    </div>
  );
}
