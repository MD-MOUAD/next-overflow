"use client";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import React, { useState } from "react";
interface customInputProps {
  // route: string;
  iconPosition: string;
  imgSrc: string;
  placeholder: string;
  otherClasses?: string;
}

const LocalSearchbar = ({
  // route, //TODO
  iconPosition,
  imgSrc,
  placeholder,
  otherClasses,
}: customInputProps) => {
  const [searchTerm, setSearchTerm] = useState("");
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
