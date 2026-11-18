'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { WeeklyPlan, CreateWeeklyPlanInput, UpdateWeeklyPlanInput } from '@/types';
import { getWeekStart, formatDate } from '@/lib/utils';

export function useWeeklyPlans(weekStart?: Date, fetchAll?: boolean) {
  const [plans, setPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekStartStr = useMemo(
    () => formatDate(weekStart ?? getWeekStart()),
    [weekStart]
  );

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (!fetchAll) {
        params.set('weekStart', weekStartStr);
      }
      const res = await fetch(`/api/weekly-plans?${params}`);
      if (!res.ok) throw new Error('Failed to fetch weekly plans');
      const data = await res.json();
      setPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [weekStartStr, fetchAll]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = async (input: CreateWeeklyPlanInput) => {
    const res = await fetch('/api/weekly-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create weekly plan');
    await fetchPlans();
  };

  const updatePlan = async (id: string, input: UpdateWeeklyPlanInput) => {
    const res = await fetch(`/api/weekly-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to update weekly plan');
    await fetchPlans();
  };

  const deletePlan = async (id: string) => {
    const res = await fetch(`/api/weekly-plans/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete weekly plan');
    await fetchPlans();
  };

  return { plans, loading, error, createPlan, updatePlan, deletePlan, refetch: fetchPlans };
}
