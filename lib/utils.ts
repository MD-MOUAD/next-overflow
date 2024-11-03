import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import qs from "query-string";

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

export const formatAndDivideNumber = (
  num: number,
  locale: string = "en-US",
): string => {
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

export const getJoinedDate = (date: Date): string => {
  // Extract the month and year from the Date object
  const month = date?.toLocaleString("default", { month: "long" });
  const year = date?.getFullYear();

  // Create the joined date string (e.g., "September 2023")
  const joinedDate = `${month} ${year}`;

  return joinedDate;
};

interface UrlQueryParams {
  params: string; // The current query parameters as a string
  key: string; // The key of the query parameter to update
  value: string | null; // The new value for the query parameter
}

/**
 * Constructs a new URL query string by setting the value for a specified key.
 *
 * @param {UrlQueryParams} param - An object containing the current params, key to update, and its new value.
 * @returns {string} - The updated URL query string.
 */
export const formUrlQuery = ({
  params,
  key,
  value,
}: UrlQueryParams): string => {
  // Parse the current query parameters into an object
  const currentUrl = qs.parse(params);

  // Set the specified key to the new value
  currentUrl[key] = value;

  // Convert the updated parameters back into a query string format
  return qs.stringifyUrl(
    {
      url: window.location.pathname, // Keep the current path
      query: currentUrl, // The updated query parameters
    },
    { skipNull: true }, // Skip null values in the final query string
  );
};

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const removeKeysFromQuery = ({
  params,
  keysToRemove,
}: RemoveUrlQueryParams) => {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true },
  );
};
