import { startOfWeek, endOfWeek, format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 }); // Sunday
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
}

export function formatDateKo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'M월 d일 (EEE)', { locale: ko });
}

export const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;

export function getDayLabel(dayOfWeek: number): string {
  return DAY_LABELS[dayOfWeek] ?? '';
}
