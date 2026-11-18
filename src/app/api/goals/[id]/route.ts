import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import YearlyGoal from '@/models/YearlyGoal';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const goal = await YearlyGoal.findById(params.id);
  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }
  return NextResponse.json(goal);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const body = await request.json();
  const goal = await YearlyGoal.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }
  return NextResponse.json(goal);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const goal = await YearlyGoal.findByIdAndDelete(params.id);
  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Goal deleted' });
}
