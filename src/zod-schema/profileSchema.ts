import { object, string, union, undefined as zUndefined } from "zod";

export const profileSchema = object({
  username: string().min(3),
  email: string().email(),
  password: union([string().min(6), zUndefined()]),
});

export type ProfileType = typeof profileSchema._input;
export type ErrorType = Record<string, string>;
