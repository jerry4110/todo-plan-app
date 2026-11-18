'use client';

import { useState, useEffect, useCallback } from 'react';
import type { YearlyGoal, CreateYearlyGoalInput, UpdateYearlyGoalInput } from '@/types';

export function useGoals() {
  const [goals, setGoals] = useState<YearlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/goals');
      if (!res.ok) throw new Error('Failed to fetch goals');
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const createGoal = async (input: CreateYearlyGoalInput) => {
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create goal');
    await fetchGoals();
  };

  const updateGoal = async (id: string, input: UpdateYearlyGoalInput) => {
    const res = await fetch(`/api/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to update goal');
    await fetchGoals();
  };

  const deleteGoal = async (id: string) => {
    const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete goal');
    await fetchGoals();
  };

  return { goals, loading, error, createGoal, updateGoal, deleteGoal, refetch: fetchGoals };
}
