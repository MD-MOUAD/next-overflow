import QuestionCard from "@/components/cards/QuestionCard";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { QuestionFilters } from "@/constants/filters";
import { getSavedQuestions } from "@/lib/actions/user.actions";
import { parsePageNumber } from "@/lib/utils";
import { SearchParamsProps } from "@/types";
import { auth } from "@clerk/nextjs/server";

const Page = async ({ searchParams }: SearchParamsProps) => {
  const { userId } = auth();
  if (!userId) return null;
  const { savedQuestions, hasNextPage } = await getSavedQuestions({
    clerkId: userId,
    searchQuery: searchParams.q,
    filter: searchParams.filter,
    page: parsePageNumber(searchParams.page),
  });
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>

      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          route="/collection"
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
        <Filter
          filters={QuestionFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {savedQuestions.length > 0 ? (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          savedQuestions.map((question: any) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="No Saved Questions Found"
            description="It appears that there are no saved questions in your collection at the moment 😊. Start exploring and saving questions that pique your interest ☀️"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
      <div className="mt-10 w-full">
        <Pagination
          pageNumber={parsePageNumber(searchParams.page)}
          hasNextPage={hasNextPage}
          pageHasResults={savedQuestions.length > 0}
        />
      </div>
    </>
  );
};
export default Page;
