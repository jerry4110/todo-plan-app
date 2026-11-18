import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  weeklyPlanId?: mongoose.Types.ObjectId;
  weeklyGoalId?: mongoose.Types.ObjectId;
  dayOfWeek?: number;
  order: number;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new Schema<ITodo>(
  {
    title: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['todo', 'doing', 'done'], default: 'todo' },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    dueDate: { type: Date },
    weeklyPlanId: { type: Schema.Types.ObjectId, ref: 'WeeklyPlan' },
    weeklyGoalId: { type: Schema.Types.ObjectId },
    dayOfWeek: { type: Number, min: 0, max: 6 },
    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

const Todo: Model<ITodo> =
  mongoose.models.Todo || mongoose.model<ITodo>('Todo', TodoSchema);

export default Todo;
