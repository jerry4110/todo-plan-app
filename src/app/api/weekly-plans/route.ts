import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WeeklyPlan from '@/models/WeeklyPlan';
import { getSessionUser } from '@/lib/getSessionUser';

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const { searchParams } = new URL(request.url);
  const yearlyGoalId = searchParams.get('yearlyGoalId');
  const weekStart = searchParams.get('weekStart');

  const filter: Record<string, string> = { userId: user.id };
  if (yearlyGoalId) filter.yearlyGoalId = yearlyGoalId;
  if (weekStart) filter.weekStart = weekStart;

  const plans = await WeeklyPlan.find(filter)
    .sort({ weekStart: -1, order: 1 })
    .populate('yearlyGoalId', 'title');
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  if (!body.weekStart || !Array.isArray(body.goals) || body.goals.length === 0) {
    return NextResponse.json(
      { error: 'weekStart and goals are required' },
      { status: 400 }
    );
  }

  if (body.goals.length > 5) {
    return NextResponse.json(
      { error: 'Maximum 5 goals allowed' },
      { status: 400 }
    );
  }

  const plan = await WeeklyPlan.create({
    yearlyGoalId: body.yearlyGoalId || undefined,
    weekStart: new Date(body.weekStart),
    goals: body.goals.map((g: { title: string }) => ({ title: g.title, completed: false })),
    memo: body.memo ?? '',
    retrospective: body.retrospective ?? '',
    order: body.order ?? 0,
    userId: user.id,
  });

  return NextResponse.json(plan, { status: 201 });
}
