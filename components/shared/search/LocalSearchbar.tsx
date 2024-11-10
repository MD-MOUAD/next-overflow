"use client";
import { Input } from "@/components/ui/input";
import { formUpdatedUrlQuery } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

interface CustomInputProps {
  route: string;
  iconPosition: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearchbar = ({
  route,
  iconPosition,
  imgSrc,
  placeholder,
  otherClasses,
}: CustomInputProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q");
  const [searchTerm, setSearchTerm] = useState(initialQuery || "");
  const [pendingSearchTerm, setPendingSearchTerm] = useState(searchTerm);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle input change
  const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingSearchTerm(e.target.value);

    // Clear previous debounce timer if any
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Set a new debounce timer
    debounceRef.current = setTimeout(() => {
      setSearchTerm(e.target.value);
    }, 300);
  };

  // Update the URL when the search term changes
  useEffect(() => {
    if (pathname === route && searchTerm !== initialQuery) {
      const newUrl = formUpdatedUrlQuery({
        params: searchParams.toString(),
        updates: {
          q: searchTerm || null,
          page: searchTerm ? null : searchParams.get("page"), // Reset page on new search term
        },
      });

      router.push(newUrl, { scroll: false });
    }
  }, [searchTerm, initialQuery, route, pathname, router, searchParams]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${
        iconPosition === "right" ? "flex-row-reverse" : ""
      } ${otherClasses}`}
    >
      <Image
        src={imgSrc}
        width={24}
        height={24}
        alt="search icon"
        className="cursor-pointer"
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={pendingSearchTerm}
        onChange={handleInputOnChange}
        className="paragraph-regular no-focus text-dark400_light700 border-none !bg-transparent shadow-none outline-none"
      />
    </div>
  );
};

export default LocalSearchbar;
