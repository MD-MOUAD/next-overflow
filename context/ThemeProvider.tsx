"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  mode: string;
  setMode: (mode: string) => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState(localStorage.getItem("theme") || "system");

  useEffect(() => {
    const handleThemeChange = () => {
      if (
        mode === "dark" ||
        (mode === "system" &&
          window.matchMedia("prefers-color-scheme: dark").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    handleThemeChange();
    const mediaQueryList = window.matchMedia("prefers-color-scheme: dark");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      setMode(event.matches ? "dark" : "light");
    };
    mediaQueryList.addEventListener("change", handleMediaChange);

    return () => {
      mediaQueryList.removeEventListener("change", handleMediaChange);
    };
  }, [mode]);

  const setThemeMode = (newMode: string) => {
    setMode(newMode);
    if (newMode === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newMode);
    }
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode: setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
