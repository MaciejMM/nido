import { Types } from "mongoose";

import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/validators/user";
import { CustodyEntry } from "@/models/CustodyEntry";
import { User, type IUser, type UserRole } from "@/models/User";
import type { UserDto } from "@/types";
import { ConflictError, NotFoundError, ValidationError } from "@/utils/errors";

function toUserDto(user: IUser): UserDto {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

async function assertUniqueRole(
  role: UserRole,
  excludeId?: string,
): Promise<void> {
  const filter: Record<string, unknown> = { role };
  if (excludeId) {
    filter._id = { $ne: new Types.ObjectId(excludeId) };
  }

  const existing = await User.findOne(filter).exec();
  if (existing) {
    throw new ConflictError("Użytkownik z tą rolą już istnieje");
  }
}

export async function getParents(): Promise<UserDto[]> {
  const users = await User.find().sort({ role: 1 }).exec();
  return users.map(toUserDto);
}

export async function getUserById(id: string): Promise<UserDto | null> {
  const user = await User.findById(id).exec();
  return user ? toUserDto(user) : null;
}

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const parsed = createUserSchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(
      "Nieprawidłowe dane użytkownika",
      parsed.error.flatten(),
    );
  }

  const { name, email, role } = parsed.data;

  await assertUniqueRole(role);

  const existingEmail = await User.findOne({ email }).exec();
  if (existingEmail) {
    throw new ConflictError("Użytkownik z tym adresem e-mail już istnieje");
  }

  const user = await User.create({ name, email, role });
  return toUserDto(user);
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
): Promise<UserDto> {
  const parsed = updateUserSchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(
      "Nieprawidłowe dane użytkownika",
      parsed.error.flatten(),
    );
  }

  const user = await User.findById(id).exec();
  if (!user) {
    throw new NotFoundError("Nie znaleziono użytkownika");
  }

  const { name, email, role } = parsed.data;

  if (role && role !== user.role) {
    await assertUniqueRole(role, id);
  }

  if (email && email !== user.email) {
    const existingEmail = await User.findOne({ email }).exec();
    if (existingEmail && existingEmail._id.toString() !== id) {
      throw new ConflictError("Użytkownik z tym adresem e-mail już istnieje");
    }
  }

  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;

  await user.save();
  return toUserDto(user);
}

export async function deleteUser(id: string): Promise<void> {
  const user = await User.findById(id).exec();
  if (!user) {
    throw new NotFoundError("Nie znaleziono użytkownika");
  }

  await CustodyEntry.deleteMany({ ownerId: user._id }).exec();
  await user.deleteOne();
}
