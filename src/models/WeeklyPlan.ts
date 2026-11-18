import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWeeklyGoal {
  _id: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
}

export interface IWeeklyPlan extends Document {
  yearlyGoalId?: mongoose.Types.ObjectId;
  weekStart: Date;
  goals: IWeeklyGoal[];
  memo: string;
  retrospective: string;
  order: number;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyGoalSchema = new Schema<IWeeklyGoal>(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { _id: true }
);

const WeeklyPlanSchema = new Schema<IWeeklyPlan>(
  {
    yearlyGoalId: { type: Schema.Types.ObjectId, ref: 'YearlyGoal' },
    weekStart: { type: Date, required: true },
    goals: { type: [WeeklyGoalSchema], default: [] },
    memo: { type: String, default: '' },
    retrospective: { type: String, default: '' },
    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

const WeeklyPlan: Model<IWeeklyPlan> =
  mongoose.models.WeeklyPlan || mongoose.model<IWeeklyPlan>('WeeklyPlan', WeeklyPlanSchema);

export default WeeklyPlan;
