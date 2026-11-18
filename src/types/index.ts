export interface YearlyGoal {
  _id: string;
  title: string;
  description: string;
  year: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyGoal {
  _id: string;
  title: string;
  completed: boolean;
}

export interface WeeklyPlan {
  _id: string;
  yearlyGoalId?: string;
  weekStart: string;
  goals: WeeklyGoal[];
  memo: string;
  retrospective: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type TodoStatus = 'todo' | 'doing' | 'done';
export type Priority = 'high' | 'medium' | 'low';

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  status: TodoStatus;
  priority: Priority;
  dueDate?: string;
  weeklyPlanId?: string;
  weeklyGoalId?: string;
  dayOfWeek?: number; // 0=Mon ~ 6=Sun
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Form input types (without _id and timestamps)
export type CreateYearlyGoalInput = Pick<YearlyGoal, 'title' | 'description' | 'year'>;
export type UpdateYearlyGoalInput = Partial<Pick<YearlyGoal, 'title' | 'description' | 'order'>>;

export type CreateWeeklyPlanInput = {
  weekStart: string;
  goals: { title: string }[];
  yearlyGoalId?: string;
  memo?: string;
};
export type UpdateWeeklyPlanInput = Partial<{
  yearlyGoalId: string;
  goals: WeeklyGoal[];
  memo: string;
  retrospective: string;
  order: number;
}>;

export type CreateTodoInput = Pick<Todo, 'title'> & {
  weeklyPlanId?: string;
  weeklyGoalId?: string;
  dayOfWeek?: number;
  description?: string;
  priority?: Priority;
  dueDate?: string;
};
export type UpdateTodoInput = Partial<Pick<Todo, 'title' | 'description' | 'status' | 'priority' | 'dueDate' | 'dayOfWeek' | 'order' | 'weeklyPlanId' | 'weeklyGoalId'>>;
