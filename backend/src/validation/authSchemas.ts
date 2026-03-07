import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  display_name: z.string().min(1).optional(),
});
