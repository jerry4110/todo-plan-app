import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  githubId: string;
  username: string;
  email: string;
  avatarUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    githubId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
