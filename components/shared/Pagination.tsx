"use client";
import React from "react";
import { Button } from "../ui/button";
import { formUpdatedUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageNumber: number;
  hasNextPage: boolean;
}
const Pagination = ({ pageNumber, hasNextPage }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleNavigation = (direction: string) => {
    const newPageNumber =
      direction === "prev" ? pageNumber - 1 : pageNumber + 1;
    const newUrl = formUpdatedUrlQuery({
      params: searchParams.toString(),
      updates: {
        page: newPageNumber.toString(),
      },
    });

    router.push(newUrl);
  };
  return (
    <div className="flex-center w-full gap-2">
      <Button
        disabled={pageNumber === 1}
        onClick={() => {
          handleNavigation("prev");
        }}
        className="light-border-2 btn flex-center min-h-[36px] gap-2 border"
      >
        <p className="text-dark200_light800 body-medium">Prev</p>
      </Button>
      <div className="flex-center rounded-md bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{pageNumber}</p>
      </div>
      <Button
        disabled={!hasNextPage}
        onClick={() => {
          handleNavigation("next");
        }}
        className="light-border-2 btn flex-center min-h-[36px] gap-2 border"
      >
        <p className="text-dark200_light800 body-medium">Next</p>
      </Button>
    </div>
  );
};

export default Pagination;
