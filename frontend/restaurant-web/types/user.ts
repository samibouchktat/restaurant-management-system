import type { UserRole } from "./auth";

export type UserResponse = {
  id: number;
  internalId: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserCreateRequest = {
  firstName: string;
  lastName: string;
  role: UserRole;
  password: string;
};

export type UserUpdateRequest = {
  firstName: string;
  lastName: string;
  role: UserRole;
};

export type ResetPasswordRequest = {
  newPassword: string;
};