"use client";
import { Theme, ThemeContextType } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    // Retrieve saved theme from local storage on mount
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const applyTheme = (themeToApply: Theme) => {
      if (themeToApply === "system") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
          document.documentElement.classList.toggle("dark", mediaQuery.matches);
        };
        handleChange();
        mediaQuery.addEventListener("change", handleChange);

        // Cleanup listener on component unmount
        return () => mediaQuery.removeEventListener("change", handleChange);
      } else {
        document.documentElement.classList.toggle(
          "dark",
          themeToApply === "dark",
        );
      }
    };

    // Apply the theme based on saved or current theme
    const cleanup = applyTheme(savedTheme || theme);

    // Cleanup function for the effect
    return () => {
      if (cleanup) cleanup();
    };
  }, [theme]);

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (newTheme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
