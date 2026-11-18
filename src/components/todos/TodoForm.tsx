'use client';

import { useState, useEffect } from 'react';
import { DAY_LABELS } from '@/lib/utils';
import { format } from 'date-fns';
import type { Priority, WeeklyPlan, TodoStatus } from '@/types';

interface TodoFormProps {
  weeklyPlanId?: string;
  onSubmit: (data: {
    title: string;
    description?: string;
    weeklyPlanId?: string;
    weeklyGoalId?: string;
    dayOfWeek?: number;
    priority?: Priority;
    dueDate?: string;
    status?: TodoStatus;
  }) => Promise<void>;
  onClose?: () => void;
  isModal?: boolean;
}

const inputClass = "w-full px-3 py-2.5 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none transition-colors";
const labelClass = "block text-sm font-medium text-body mb-1.5";

export default function TodoForm({ weeklyPlanId, onSubmit, onClose, isModal }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TodoStatus>('todo');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState(isModal ?? false);

  const [allPlans, setAllPlans] = useState<WeeklyPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState(weeklyPlanId ?? '');
  const [selectedGoalId, setSelectedGoalId] = useState('');

  const showPlanLink = !weeklyPlanId;

  useEffect(() => {
    if (!showPlanLink) return;
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/weekly-plans');
        if (res.ok) {
          const data = await res.json();
          setAllPlans(data);
        }
      } catch {
        // ignore
      }
    };
    fetchPlans();
  }, [showPlanLink]);

  const selectedPlan = allPlans.find((p) => p._id === selectedPlanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const effectivePlanId = weeklyPlanId || selectedPlanId || undefined;
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        weeklyPlanId: effectivePlanId,
        weeklyGoalId: selectedGoalId || undefined,
        dayOfWeek: effectivePlanId ? dayOfWeek : undefined,
        priority,
        dueDate: dueDate || undefined,
        status,
      });
      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('medium');
      setStatus('todo');
      setSelectedPlanId(weeklyPlanId ?? '');
      setSelectedGoalId('');
      if (onClose) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const getPlanLabel = (plan: WeeklyPlan) => {
    const ws = new Date(plan.weekStart);
    const goalCount = plan.goals?.length ?? 0;
    return `${format(ws, 'M/d')} 주 (${goalCount}개 목표)`;
  };

  // Inline form
  if (!isModal) {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="새 할일 추가" className={inputClass} required />
          </div>
          {weeklyPlanId && (
            <select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))} className="px-3 py-2.5 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none transition-colors">
              {DAY_LABELS.map((label, i) => (<option key={i} value={i}>{label}</option>))}
            </select>
          )}
          <button type="button" onClick={() => setExpanded(!expanded)} className="px-3 py-2.5 border border-hairline rounded-[8px] text-sm text-muted hover:bg-surface-soft transition-colors">
            {expanded ? '접기' : '상세'}
          </button>
          <button type="submit" disabled={submitting || !title.trim()} className="px-5 py-2.5 bg-rausch text-white rounded-[8px] hover:bg-rausch-active disabled:bg-rausch-disabled text-sm font-medium whitespace-nowrap transition-colors">
            추가
          </button>
        </div>

        {expanded && (
          <div className="flex gap-2 items-end flex-wrap">
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="px-3 py-2.5 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none transition-colors">
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="px-3 py-2.5 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none transition-colors" />
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="설명 (선택)" className="flex-1 px-3 py-2.5 border border-hairline rounded-[8px] text-sm bg-background focus:border-ink focus:ring-0 focus:outline-none transition-colors" />
          </div>
        )}
      </form>
    );
  }

  // Modal form
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-[14px] shadow-card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-bold">새 할 일</h2>

          <div>
            <label className={labelClass}>제목 *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="할 일 제목" className={inputClass} required />
          </div>

          <div>
            <label className={labelClass}>설명</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="상세 설명..." className={`${inputClass} h-16 resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>우선순위</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputClass}>
                <option value="high">높음</option>
                <option value="medium">보통</option>
                <option value="low">낮음</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>상태</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as TodoStatus)} className={inputClass}>
                <option value="todo">할 일</option>
                <option value="doing">진행 중</option>
                <option value="done">완료</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>마감일</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
          </div>

          {showPlanLink && (
            <>
              <div>
                <label className={labelClass}>주간 계획 연결</label>
                <select value={selectedPlanId} onChange={(e) => { setSelectedPlanId(e.target.value); setSelectedGoalId(''); }} className={inputClass}>
                  <option value="">연결 안 함</option>
                  {allPlans.map((p) => (<option key={p._id} value={p._id}>{getPlanLabel(p)}</option>))}
                </select>
              </div>

              {selectedPlan && selectedPlan.goals && selectedPlan.goals.length > 0 && (
                <div>
                  <label className={labelClass}>주간 목표 연동</label>
                  <select value={selectedGoalId} onChange={(e) => setSelectedGoalId(e.target.value)} className={inputClass}>
                    <option value="">선택 안 함</option>
                    {selectedPlan.goals.map((g) => (<option key={g._id} value={g._id}>{g.title}</option>))}
                  </select>
                  <p className="text-xs text-muted-soft mt-1">완료 시 주간 목표도 함께 완료</p>
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 border border-ink rounded-[8px] text-sm hover:bg-surface-soft font-medium transition-colors">
              취소
            </button>
            <button type="submit" disabled={submitting || !title.trim()} className="px-5 py-2.5 bg-rausch text-white rounded-[8px] text-sm hover:bg-rausch-active disabled:bg-rausch-disabled font-medium transition-colors">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
