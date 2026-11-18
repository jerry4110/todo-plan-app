import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const weeklyPlanId = searchParams.get('weeklyPlanId');
  const status = searchParams.get('status');

  const filter: Record<string, string> = {};
  if (weeklyPlanId) filter.weeklyPlanId = weeklyPlanId;
  if (status) filter.status = status;

  const todos = await Todo.find(filter).sort({ order: 1 });
  return NextResponse.json(todos);
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const body = await request.json();

  if (!body.title) {
    return NextResponse.json(
      { error: 'title is required' },
      { status: 400 }
    );
  }

  const todo = await Todo.create({
    title: body.title,
    description: body.description,
    status: body.status ?? 'todo',
    priority: body.priority ?? 'medium',
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    weeklyPlanId: body.weeklyPlanId || undefined,
    weeklyGoalId: body.weeklyGoalId || undefined,
    dayOfWeek: body.dayOfWeek ?? (body.weeklyPlanId ? 0 : undefined),
    order: body.order ?? 0,
  });

  return NextResponse.json(todo, { status: 201 });
}
