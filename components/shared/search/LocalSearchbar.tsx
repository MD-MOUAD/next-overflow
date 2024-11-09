"use client";
import { Input } from "@/components/ui/input";
import { formUpdatedUrlQuery } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
interface customInputProps {
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
}: customInputProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q");
  const [searchTerm, setSearchTerm] = useState(query || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== "") {
        // If there is a search term, update the URL with the new query
        const newUrl = formUpdatedUrlQuery({
          params: searchParams.toString(),
          updates: {
            q: searchTerm,
          },
        });
        // Navigate to the new URL without scrolling to the top
        router.push(newUrl, { scroll: false });
      } else {
        if (pathname === route) {
          const newUrl = formUpdatedUrlQuery({
            params: searchParams.toString(),
            updates: {
              q: null, // remove query parameter 'q'
            },
          });

          router.push(newUrl, { scroll: false });
        }
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, router, route, pathname, searchParams]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-[56px] grow items-center gap-4 rounded-[10px] px-4 ${iconPosition === "right" && "flex-row-reverse"} ${otherClasses}`}
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
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="paragraph-regular no-focus text-dark400_light700 border-none !bg-transparent shadow-none outline-none"
      />
    </div>
  );
};

export default LocalSearchbar;
