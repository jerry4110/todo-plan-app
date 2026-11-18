import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WeeklyPlan from '@/models/WeeklyPlan';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const plan = await WeeklyPlan.findById(params.id).populate('yearlyGoalId', 'title');
  if (!plan) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }
  return NextResponse.json(plan);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const body = await request.json();

  if (body.weekStart) {
    body.weekStart = new Date(body.weekStart);
  }

  if (body.goals && body.goals.length > 5) {
    return NextResponse.json(
      { error: 'Maximum 5 goals allowed' },
      { status: 400 }
    );
  }

  const plan = await WeeklyPlan.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!plan) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }
  return NextResponse.json(plan);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const plan = await WeeklyPlan.findByIdAndDelete(params.id);
  if (!plan) {
    return NextResponse.json({ error: 'Weekly plan not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Weekly plan deleted' });
}
