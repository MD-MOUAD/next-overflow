// components/CountrySelector.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import Image from "next/image";

interface Country {
  name: { common: string };
  cca2: string;
  flags: { png: string; alt: string };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CountrySelector = ({ onChange }: { onChange: any }) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const sortedData = data.sort((a: Country, b: Country) =>
          a.name.common.localeCompare(b.name.common),
        );
        setCountries(sortedData);
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  if (loading) return <p>Loading countries...</p>;

  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="paragraph-regular light-border-2 background-light800_dark300 text-dark300_light700 min-h-[56px] border">
        <div className="line-clamp-1 flex-1 text-left">
          <SelectValue placeholder="Where are you from?" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {countries.map((country) => (
            <SelectItem
              key={country.cca2}
              value={country.name.common}
              className="py-3"
            >
              <div className="flex items-center gap-2">
                <Image
                  src={country.flags.png}
                  alt={country.flags.alt}
                  width={20}
                  height={20}
                  className="size-5 rounded-full object-cover"
                />
                <span className="">{country.name.common}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CountrySelector;
