import UserCard from "@/components/cards/UserCard";
import Filter from "@/components/shared/Filter";
import Pagination from "@/components/shared/Pagination";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { UserFilters } from "@/constants/filters";
import { getAllUsers } from "@/lib/actions/user.actions";
import { parsePageNumber } from "@/lib/utils";
import { SearchParamsProps } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community | Next Overflow",
};

const Page = async ({ searchParams }: SearchParamsProps) => {
  const { users, hasNextPage } = await getAllUsers({
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: parsePageNumber(searchParams.page),
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">All Users</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/community"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search for amazing minds"
          otherClasses="flex-1"
        />
        <Filter
          filters={UserFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>
      <section className="mt-12 flex flex-wrap gap-4">
        {users.length > 0 ? (
          users.map((user) => (
            <div className="flex-center max-sm:w-full" key={user._id}>
              <UserCard user={user} />
            </div>
          ))
        ) : (
          <p className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center">
            No users Found!
          </p>
        )}
      </section>
      <div className="mt-10 w-full">
        <Pagination
          pageNumber={parsePageNumber(searchParams.page)}
          hasNextPage={hasNextPage}
          pageHasResults={users.length > 0}
        />
      </div>
    </>
  );
};

export default Page;
