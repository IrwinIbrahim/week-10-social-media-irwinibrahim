import { z } from "zod";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const TYPES = ["image/jpeg", "image/png"];

export const editProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(50, "Max 50 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscore"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Number phone is required")
    .regex(/^[0-9+]{9,15}$/, "Invalid phone number"),
  bio: z.string().trim().max(300, "Bio must be at most 300 characters"),
  avatar: z
    .custom<File>(
      (v) =>
        v === undefined || (typeof File !== "undefined" && v instanceof File),
    )
    .refine((f) => !f || TYPES.includes(f.type), "Only PNG or JPG allowed")
    .refine((f) => !f || f.size <= MAX_SIZE, "Max file size is 5 MB")
    .optional(),
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;
