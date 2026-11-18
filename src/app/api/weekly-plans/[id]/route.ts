import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WeeklyPlan from '@/models/WeeklyPlan';
import { getSessionUser } from '@/lib/getSessionUser';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const plan = await WeeklyPlan.findOne({ _id: params.id, userId: user.id }).populate('yearlyGoalId', 'title');
  if (!plan) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }
  return NextResponse.json(plan);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  const { weekStart, goals, memo, retrospective, yearlyGoalId, order } = body;
  const updateData: Record<string, unknown> = {};
  if (weekStart !== undefined) updateData.weekStart = new Date(weekStart);
  if (goals !== undefined) {
    if (goals.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 goals allowed' },
        { status: 400 }
      );
    }
    updateData.goals = goals;
  }
  if (memo !== undefined) updateData.memo = memo;
  if (retrospective !== undefined) updateData.retrospective = retrospective;
  if (yearlyGoalId !== undefined) updateData.yearlyGoalId = yearlyGoalId;
  if (order !== undefined) updateData.order = order;

  const plan = await WeeklyPlan.findOneAndUpdate(
    { _id: params.id, userId: user.id },
    updateData,
    { new: true, runValidators: true }
  );
  if (!plan) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }
  return NextResponse.json(plan);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const plan = await WeeklyPlan.findOneAndDelete({ _id: params.id, userId: user.id });
  if (!plan) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Weekly plan deleted' });
}
