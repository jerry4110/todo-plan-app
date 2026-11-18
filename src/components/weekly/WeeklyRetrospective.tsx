'use client';

import { useState, useEffect } from 'react';

interface WeeklyRetrospectiveProps {
  value: string;
  onSave: (retrospective: string) => Promise<void>;
}

export default function WeeklyRetrospective({ value, onSave }: WeeklyRetrospectiveProps) {
  const [text, setText] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleSave = async () => {
    if (text !== value) {
      setSaving(true);
      try {
        await onSave(text);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-body block mb-1.5">
        주간 회고 {saving && <span className="text-rausch text-xs">저장 중...</span>}
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        placeholder="이번 주를 돌아보며 회고를 작성하세요..."
        className="w-full px-3 py-2.5 border border-hairline rounded-[8px] bg-background focus:border-ink focus:ring-0 focus:outline-none text-sm min-h-[100px] transition-colors"
      />
    </div>
  );
}
