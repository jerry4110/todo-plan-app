'use client';

import { useState, useEffect } from 'react';

interface WeeklyMemoProps {
  value: string;
  onSave: (memo: string) => Promise<void>;
}

export default function WeeklyMemo({ value, onSave }: WeeklyMemoProps) {
  const [memo, setMemo] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMemo(value);
  }, [value]);

  const handleBlur = async () => {
    if (memo !== value) {
      setSaving(true);
      try {
        await onSave(memo);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-body block mb-1.5">
        메모 {saving && <span className="text-rausch text-xs">저장 중...</span>}
      </label>
      <textarea
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        onBlur={handleBlur}
        placeholder="이번 주 메모를 작성하세요..."
        className="w-full px-3 py-2.5 border border-hairline rounded-[8px] bg-background focus:border-ink focus:ring-0 focus:outline-none text-sm min-h-[60px] transition-colors"
      />
    </div>
  );
}
