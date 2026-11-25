import { z } from 'zod';

export const ROLES = ['admin', 'customer'] as const;
export type Role = (typeof ROLES)[number];

/** A user as the browser sees them — never includes credentials. */
export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export const MIN_PASSWORD_LENGTH = 8;

const email = z.email('Enter a valid email, like name@example.com.').trim().toLowerCase();

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password.'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name.').max(80),
  email,
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`)
    .max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
