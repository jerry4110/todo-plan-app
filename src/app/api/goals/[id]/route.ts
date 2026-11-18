import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import YearlyGoal from '@/models/YearlyGoal';
import { getSessionUser } from '@/lib/getSessionUser';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const goal = await YearlyGoal.findOne({ _id: params.id, userId: user.id });
  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }
  return NextResponse.json(goal);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  const { title, description, year, order } = body;
  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (year !== undefined) updateData.year = year;
  if (order !== undefined) updateData.order = order;

  const goal = await YearlyGoal.findOneAndUpdate(
    { _id: params.id, userId: user.id },
    updateData,
    { new: true, runValidators: true }
  );
  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }
  return NextResponse.json(goal);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const goal = await YearlyGoal.findOneAndDelete({ _id: params.id, userId: user.id });
  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Goal deleted' });
}
