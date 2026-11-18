'use client';

import { useState, useEffect } from 'react';
import type { YearlyGoal } from '@/types';

interface GoalFormProps {
  onSubmit: (data: { title: string; description: string; year: number }) => Promise<void>;
  initialData?: YearlyGoal | null;
  onCancel?: () => void;
}

const inputClass = "w-full px-3 py-2.5 border border-hairline rounded-[8px] bg-background focus:border-ink focus:ring-0 focus:outline-none transition-colors";

export default function GoalForm({ onSubmit, initialData, onCancel }: GoalFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), year: new Date().getFullYear() });
      if (!initialData) {
        setTitle('');
        setDescription('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-background rounded-[14px] border border-hairline p-5 space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="목표 제목"
        className={inputClass}
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="목표 설명"
        className={`${inputClass} min-h-[80px]`}
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="px-5 py-2.5 bg-rausch text-white rounded-[8px] hover:bg-rausch-active disabled:bg-rausch-disabled font-medium transition-colors"
        >
          {initialData ? '수정' : '추가'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-ink rounded-[8px] hover:bg-surface-soft font-medium transition-colors"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
