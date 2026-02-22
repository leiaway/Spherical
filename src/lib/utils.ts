import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with clsx and tailwind-merge (later classes override earlier).
 * Use for conditional and composed className strings in components.
 *
 * @param inputs - ClassValue[] (string, object, array from clsx)
 * @returns string - Single className string with conflicts resolved by tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
