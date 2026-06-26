import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { prisma } from "../infra/prisma.js";
import { sign } from "../infra/http.js";
import { AppError } from "../infra/error-handler.js";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
}

interface AuthResult {
  user: AuthUser;
  token: string;
}

/**
 * Register a new user account.
 * Throws ConflictError (409) if the email is already registered.
 */
export async function register(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const profile = await prisma.profile.create({
    data: {
      id: randomUUID(),
      email,
      displayName: displayName ?? null,
      passwordHash,
    },
  });

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "Server configuration error");
  }

  const token = sign({ userId: profile.id }, secret, TOKEN_EXPIRY);

  return {
    user: {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
    },
    token,
  };
}

/**
 * Authenticate an existing user.
 * Throws UnauthorizedError (401) if credentials are invalid.
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  const profile = await prisma.profile.findUnique({ where: { email } });
  if (!profile || !profile.passwordHash) {
    throw new AppError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, profile.passwordHash);
  if (!isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError(500, "Server configuration error");
  }

  const token = sign({ userId: profile.id }, secret, TOKEN_EXPIRY);

  return {
    user: {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
    },
    token,
  };
}

/**
 * Retrieve a user by their profile ID.
 * Throws NotFoundError (404) if the user does not exist.
 */
export async function getUserById(id: string): Promise<AuthUser> {
  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile) {
    throw new AppError(404, "User not found");
  }

  return {
    id: profile.id,
    email: profile.email,
    displayName: profile.displayName,
  };
}
