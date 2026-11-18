import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';
import WeeklyPlan from '@/models/WeeklyPlan';
import { getSessionUser } from '@/lib/getSessionUser';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const todo = await Todo.findOne({ _id: params.id, userId: user.id });
  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  return NextResponse.json(todo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const body = await request.json();

  const { title, description, status, priority, dueDate, weeklyPlanId, weeklyGoalId, dayOfWeek, order } = body;
  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
  if (weeklyPlanId !== undefined) updateData.weeklyPlanId = weeklyPlanId;
  if (weeklyGoalId !== undefined) updateData.weeklyGoalId = weeklyGoalId;
  if (dayOfWeek !== undefined) updateData.dayOfWeek = dayOfWeek;
  if (order !== undefined) updateData.order = order;

  // Fetch original todo to know previous status
  const originalTodo = await Todo.findOne({ _id: params.id, userId: user.id });
  if (!originalTodo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  const previousStatus = originalTodo.status;

  const todo = await Todo.findOneAndUpdate(
    { _id: params.id, userId: user.id },
    updateData,
    { new: true, runValidators: true }
  );
  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  // When a todo is marked as done and has a linked weeklyGoalId,
  // check if all todos linked to that goal are now done
  if (status === 'done' && todo.weeklyGoalId && todo.weeklyPlanId) {
    const linkedTodos = await Todo.find({ weeklyGoalId: todo.weeklyGoalId, userId: user.id });
    const allDone = linkedTodos.every((t) => t.status === 'done');

    if (allDone) {
      await WeeklyPlan.findOneAndUpdate(
        { _id: todo.weeklyPlanId, 'goals._id': todo.weeklyGoalId },
        { $set: { 'goals.$.completed': true } }
      );
    }
  }

  // When a todo is moved back from done, unmark the linked goal
  if (previousStatus === 'done' && status && status !== 'done' && todo.weeklyGoalId && todo.weeklyPlanId) {
    await WeeklyPlan.findOneAndUpdate(
      { _id: todo.weeklyPlanId, 'goals._id': todo.weeklyGoalId },
      { $set: { 'goals.$.completed': false } }
    );
  }

  return NextResponse.json(todo);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await dbConnect();
  const todo = await Todo.findOneAndDelete({ _id: params.id, userId: user.id });
  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Todo deleted' });
}
