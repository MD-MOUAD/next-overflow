"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { formUpdatedUrlQuery } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import GlobalResult from "./GlobalResult";

const GlobalSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("global");
  const [searchTerm, setSearchTerm] = useState(initialQuery || "");
  const [pendingSearchTerm, setPendingSearchTerm] = useState(searchTerm);
  const [isOpen, setIsOpen] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
    if (e.target.value === "" && isOpen) {
      setIsOpen(false);
    }

    // Clear previous debounce timer if any
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Set a new debounce timer
    debounceRef.current = setTimeout(() => {
      setSearchTerm(e.target.value);
    }, 300);
  };

  useEffect(() => {
    if (searchTerm !== initialQuery) {
      const newUrl = searchTerm
        ? formUpdatedUrlQuery({
            params: searchParams.toString(),
            updates: {
              global: searchTerm,
            },
          })
        : formUpdatedUrlQuery({
            params: searchParams.toString(),
            updates: {
              global: null,
              type: null,
            },
          });
      router.push(newUrl, { scroll: false });
    }
    if (searchTerm !== "" && !isOpen) setIsOpen(true);
  }, [searchTerm, initialQuery, pathname, router, searchParams, isOpen]);

  // Handle click outside to close the dropdown and clear search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
        setPendingSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[600px] max-lg:hidden"
    >
      <div className="background-light800_darkgradient relative flex min-h-[56px] grow items-center gap-1 rounded-xl px-4">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />
        <Input
          type="text"
          placeholder="Search globally"
          value={pendingSearchTerm}
          onChange={handleInputOnChange}
          className="paragraph-regular no-focus placeholder text-dark400_light700 border-none !bg-transparent shadow-none outline-none"
        />
      </div>
      {isOpen && searchTerm && <GlobalResult />}
    </div>
  );
};

export default GlobalSearch;
