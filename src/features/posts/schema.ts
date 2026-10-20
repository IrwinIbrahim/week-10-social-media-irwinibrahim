import { z } from "zod";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const TYPES = ["image/jpeg", "image/png"];

export const postSchema = z.object({
  image: z
    .custom<File>((v) => typeof File !== "undefined" && v instanceof File, {
      message: "Image is required",
    })
    .refine((f) => TYPES.includes(f.type), "Only PNG or JPG allowed")
    .refine((f) => f.size <= MAX_SIZE, "Max file size is 5 MB"),
  caption: z
    .string()
    .trim()
    .min(1, "Caption is required")
    .max(500, "Caption must be at most 500 characters"),
});

export type PostValues = z.infer<typeof postSchema>;
