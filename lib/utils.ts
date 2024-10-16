import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getTimestamp = (createdAt: Date): string => {
  const now = new Date();
  const yearsDifference = now.getFullYear() - createdAt.getFullYear();

  // If the difference is more than 1 year, remove "about"
  if (yearsDifference >= 1) {
    return formatDistanceToNow(createdAt, { addSuffix: true }).replace(
      "about ",
      "",
    );
  }

  // For recent timestamps, keep "about"
  return formatDistanceToNow(createdAt, { addSuffix: true });
};

export const formatAndDivideNumber = (num: number, locale: string = "en-US"): string => {
  // Check for edge cases, such as non-numeric values
  if (isNaN(num)) {
    throw new Error("Input must be a valid number");
  }

  // Determine the options for formatting
  const options: Intl.NumberFormatOptions = {
    notation: "compact", // Use compact notation for thousands and millions
    compactDisplay: "short", // Short display (e.g., "K" for thousands)
    // minimumFractionDigits: 1, // At least one decimal place
    maximumFractionDigits: 1, // At most one decimal place
  };

  // Create a formatter instance for the desired locale
  const formatter = new Intl.NumberFormat(locale, options);

  // Return the formatted number
  return formatter.format(num);
};
