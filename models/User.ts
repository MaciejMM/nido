import mongoose, { type Document, type Model, Schema } from "mongoose";

export type UserRole = "parentA" | "parentB";

export interface IUser extends Document {
  name: string;
  email: string;
  role: UserRole;
}

export interface IUserModel extends Model<IUser> {
  findByRole(role: UserRole): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["parentA", "parentB"], required: true },
  },
  { timestamps: true },
);

userSchema.statics.findByRole = function findByRole(role: UserRole) {
  return this.findOne({ role });
};

export const User =
  (mongoose.models.User as IUserModel | undefined) ??
  mongoose.model<IUser, IUserModel>("User", userSchema);
