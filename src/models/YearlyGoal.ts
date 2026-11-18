import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IYearlyGoal extends Document {
  title: string;
  description: string;
  year: number;
  order: number;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const YearlyGoalSchema = new Schema<IYearlyGoal>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    year: { type: Number, required: true },
    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true }
);

const YearlyGoal: Model<IYearlyGoal> =
  mongoose.models.YearlyGoal || mongoose.model<IYearlyGoal>('YearlyGoal', YearlyGoalSchema);

export default YearlyGoal;
