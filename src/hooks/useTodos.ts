'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Todo, CreateTodoInput, UpdateTodoInput } from '@/types';

export function useTodos(weeklyPlanId?: string) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (weeklyPlanId) params.set('weeklyPlanId', weeklyPlanId);
      const res = await fetch(`/api/todos?${params}`);
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [weeklyPlanId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const createTodo = async (input: CreateTodoInput) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to create todo');
    await fetchTodos();
  };

  const updateTodo = async (id: string, input: UpdateTodoInput) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    await fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete todo');
    await fetchTodos();
  };

  return { todos, loading, error, createTodo, updateTodo, deleteTodo, refetch: fetchTodos };
}
