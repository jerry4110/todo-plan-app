import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Todo from '@/models/Todo';
import WeeklyPlan from '@/models/WeeklyPlan';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const todo = await Todo.findById(params.id);
  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  return NextResponse.json(todo);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const body = await request.json();

  if (body.dueDate) {
    body.dueDate = new Date(body.dueDate);
  }

  // Fetch original todo to know previous status
  const originalTodo = await Todo.findById(params.id);
  if (!originalTodo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  const previousStatus = originalTodo.status;

  const todo = await Todo.findByIdAndUpdate(params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }

  // When a todo is marked as done and has a linked weeklyGoalId,
  // check if all todos linked to that goal are now done
  if (body.status === 'done' && todo.weeklyGoalId && todo.weeklyPlanId) {
    const linkedTodos = await Todo.find({ weeklyGoalId: todo.weeklyGoalId });
    const allDone = linkedTodos.every((t) => t.status === 'done');

    if (allDone) {
      await WeeklyPlan.findOneAndUpdate(
        { _id: todo.weeklyPlanId, 'goals._id': todo.weeklyGoalId },
        { $set: { 'goals.$.completed': true } }
      );
    }
  }

  // When a todo is moved back from done, unmark the linked goal
  if (previousStatus === 'done' && body.status && body.status !== 'done' && todo.weeklyGoalId && todo.weeklyPlanId) {
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
  await dbConnect();
  const todo = await Todo.findByIdAndDelete(params.id);
  if (!todo) {
    return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Todo deleted' });
}
