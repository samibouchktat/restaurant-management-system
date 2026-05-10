export type UserRole = "ADMIN" | "GERANT" | "SERVEUR" | "CAISSIER";

export type AuthUser = {
  id: number;
  internalId: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type LoginRequest = {
  internalId: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInMs: number;
  user: AuthUser;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};