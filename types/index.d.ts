import { BADGE_CRITERIA } from "@/constants";

export type Theme = "light" | "dark" | "system";

export interface ThemeItem {
  value: Theme;
  label: string;
  icon: string;
}
export interface ThemeContextType {
  theme: Theme;
  toggleTheme: (newTheme: Theme) => void;
}

export interface SidebarLinkTypes {
  imgURL: string;
  route: string;
  label: string;
}

export interface Job {
  id?: string;
  employer_name?: string;
  employer_logo?: string | undefined;
  employer_website?: string;
  job_employment_type?: string;
  job_title?: string;
  job_description?: string;
  job_apply_link?: string;

  job_city?: string;
  job_state?: string;
  job_country?: string;
}
export interface Country {
  name: {
    common: string;
  };
}
export interface ParamsProps {
  params: { id: string };
}
export interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}
export interface URLProps {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}
export interface BadgeCounts {
  GOLD: number;
  SILVER: number;
  BRONZE: number;
}
export type BadgeCriteriaType = keyof typeof BADGE_CRITERIA;

export interface GlobalSearchResults {
  id: "string";
  title: "string";
  type: "string";
}
