import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IYearlyGoal extends Document {
  title: string;
  description: string;
  year: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const YearlyGoalSchema = new Schema<IYearlyGoal>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    year: { type: Number, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const YearlyGoal: Model<IYearlyGoal> =
  mongoose.models.YearlyGoal || mongoose.model<IYearlyGoal>('YearlyGoal', YearlyGoalSchema);

export default YearlyGoal;
