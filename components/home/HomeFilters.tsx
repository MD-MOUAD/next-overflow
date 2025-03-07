"use client";
import { HomePageFilters } from "@/constants/filters";
import { useState } from "react";
import { Button } from "../ui/button";
import { formUpdatedUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

const HomeFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [active, setActive] = useState(searchParams.get("filter") || "");

  const handleFilterClick = (item: string) => {
    if (active === item) {
      setActive(""); // reset active
      const newUrl = formUpdatedUrlQuery({
        params: searchParams.toString(),
        updates: {
          filter: null, // Remove 'filter'
          page: null, // (reset page to 1)
        },
      });

      router.push(newUrl, { scroll: false });
    } else {
      setActive(item);
      const newUrl = formUpdatedUrlQuery({
        params: searchParams.toString(),
        updates: {
          filter: item.toLowerCase(),
          page: null, // (reset page to 1)
        },
      });

      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 md:flex">
      {HomePageFilters.map((item) => (
        <Button
          key={item.value}
          onClick={() => {
            handleFilterClick(item.value);
          }}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none  ${
            active === item.value
              ? "bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400"
              : "bg-light-800 text-light-500 hover:bg-light-700 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-400"
          }`}
        >
          {item.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;
