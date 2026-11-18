import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import YearlyGoal from '@/models/YearlyGoal';

export async function GET() {
  await dbConnect();
  const goals = await YearlyGoal.find().sort({ order: 1 });
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
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
  });

  return NextResponse.json(goal, { status: 201 });
}
