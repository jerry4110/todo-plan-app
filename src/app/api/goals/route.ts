import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import YearlyGoal from '@/models/YearlyGoal';
import { getSessionUser } from '@/lib/getSessionUser';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const goals = await YearlyGoal.find({ userId: user.id }).sort({ order: 1 });
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  if (!body.title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  const goal = await YearlyGoal.create({
    title: body.title,
    description: body.description ?? '',
    year: body.year ?? new Date().getFullYear(),
    order: body.order ?? 0,
    userId: user.id,
  });

  return NextResponse.json(goal, { status: 201 });
}
