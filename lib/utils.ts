import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import qs from "query-string";
import { BADGE_CRITERIA } from "@/constants";
import { BadgeCounts } from "@/types";

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

export const formUpdatedUrlQuery = ({
  params,
  updates,
}: {
  params: string;
  updates: Record<string, string | null>;
}): string => {
  // Parse the current query parameters into an object
  const currentUrl = qs.parse(params);

  // Extract the hash part if it exists
  const hashIndex = window.location.href.indexOf("#");
  const hash =
    hashIndex !== -1 ? window.location.href.substring(hashIndex) : "";

  // Update or add the specified keys to the current query parameters
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== null) {
      currentUrl[key] = value;
    } else {
      delete currentUrl[key]; // Remove the key if the value is null
    }
  });

  // Convert the updated parameters back into a query string format
  const updatedUrl = qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true },
  );

  // Append the hash back to the URL if it exists
  return `${updatedUrl}${hash}`;
};

export const parsePageNumber = (page: string | undefined) => {
  const parsedPage = parseInt(page as string, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    return 1;
  }
  return parsedPage;
};

interface BadgeParam {
  criteria: {
    type: keyof typeof BADGE_CRITERIA;
    count: number;
  }[];
}
export const assignBadges = (params: BadgeParam) => {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const badgeCounts: BadgeCounts = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  const { criteria } = params;

  criteria.forEach((item) => {
    const { type, count } = item;
    const badgeLevels: any = BADGE_CRITERIA[type];

    Object.keys(badgeLevels).forEach((level: any) => {
      if (count >= badgeLevels[level]) {
        badgeCounts[level as keyof BadgeCounts] += 1;
      }
    });
  });

  return badgeCounts;
};

export const getMostFrequent = (arr: any[], limit: number | undefined) => {
  // Step 1: Count occurrences
  const countMap = new Map<number, { item: any; count: number }>();

  arr.forEach((obj) => {
    // Step 1: Try to get the entry from the countMap using obj.id
    const entry = countMap.get(obj._id);

    // Step 2: Check if the entry exists
    if (entry) {
      // If it exists, increment the count for that entry
      entry.count++;
    } else {
      // If it doesn't exist, add a new entry with the current object and set count to 1
      countMap.set(obj._id, { item: obj, count: 1 });
    }
  });

  // Step 2: Sort by count in descending order
  const sortedItems = Array.from(countMap.values()).sort(
    (a, b) => b.count - a.count,
  );

  // Step 3: Apply the limit if provided, otherwise return all items
  if (limit) {
    return sortedItems.slice(0, limit).map((entry) => entry.item);
  }

  // Return all items if no limit is provided
  return sortedItems.map((entry) => entry.item);
};
