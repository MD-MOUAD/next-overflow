"use client";

import { useTheme } from "@/context/ThemeProvider";
import React, { useEffect, useState } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Image from "next/image";
import { themes } from "@/constants";

const Theme = () => {
  const { theme, toggleTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkMode(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };

      mediaQuery.addEventListener("change", handleChange);

      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    } else {
      setIsDarkMode(theme === "dark");
    }
  }, [theme]);

  return (
    <Menubar className="relative border-none bg-transparent shadow-none dark:bg-transparent">
      <MenubarMenu>
        <MenubarTrigger className="focus:bg-light-900 data-[state=open]:bg-light-900 dark:focus:bg-dark-200 dark:data-[state=open]:bg-dark-200">
          {isDarkMode ? (
            <Image
              src="/assets/icons/moon.svg"
              alt="moon"
              width={20}
              height={20}
              className={`${theme !== "system" && "active-theme"}`}
            />
          ) : (
            <Image
              src="/assets/icons/sun.svg"
              alt="sun"
              width={20}
              height={20}
              className={`${theme !== "system" && "active-theme"}`}
            />
          )}
        </MenubarTrigger>
        <MenubarContent className="absolute -right-12 mt-3 min-w-[120px] rounded border bg-light-900 py-2 dark:border-dark-400 dark:bg-dark-300">
          {themes.map((item) => (
            <MenubarItem
              key={item.value}
              className="flex cursor-pointer items-center gap-4 px-2.5 py-2 focus:bg-light-800 dark:focus:bg-dark-400"
              onClick={() => {
                toggleTheme(item.value);
              }}
            >
              <Image
                src={item.icon}
                alt={item.value}
                width={16}
                height={16}
                className={`${theme === item.value && "active-theme"}`}
              />
              <p
                className={`body-semibold text-light-500 ${
                  theme === item.value
                    ? "text-primary-500"
                    : "text-dark100_light900"
                }`}
              >
                {item.label}
              </p>
            </MenubarItem>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default Theme;
