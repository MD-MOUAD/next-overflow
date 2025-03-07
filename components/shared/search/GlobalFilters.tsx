import { GlobalSearchFilters } from "@/constants/filters";
import { formUpdatedUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const GlobalFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParams = searchParams.get("type");
  const [active, setActive] = useState(typeParams || "");

  const handleFilterClick = (item: string) => {
    if (active === item) {
      setActive(""); // reset active
      const newUrl = formUpdatedUrlQuery({
        params: searchParams.toString(),
        updates: {
          type: null, // clear the type
        },
      });

      router.push(newUrl, { scroll: false });
    } else {
      setActive(item);
      const newUrl = formUpdatedUrlQuery({
        params: searchParams.toString(),
        updates: {
          type: item.toLowerCase(),
        },
      });

      router.push(newUrl, { scroll: false });
    }
  };
  return (
    <div className="flex items-center gap-5 px-5">
      <p className="text-dark400_light900 body-medium">Type: </p>
      <div className="flex gap-3">
        {GlobalSearchFilters.map((item) => (
          <button
            type="button"
            key={item.value}
            className={`light-border-2 small-medium rounded-2xl px-5 py-2 capitalize  
              ${
                active === item.value
                  ? "bg-primary-500 text-light-900 hover:opacity-90"
                  : "bg-light-700 text-dark-400 hover:text-primary-500 dark:bg-dark-500 dark:text-light-800 dark:hover:text-primary-500"
              }
            `}
            onClick={() => handleFilterClick(item.value)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GlobalFilters;
