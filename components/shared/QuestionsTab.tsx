import { getUserQuestions } from "@/lib/actions/user.actions";
import { SearchParamsProps } from "@/types";
import React from "react";
import QuestionCard from "../cards/QuestionCard";
import { parsePageNumber } from "@/lib/utils";
import Pagination from "./Pagination";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}
const QuestionsTab = async ({ searchParams, userId, clerkId }: Props) => {
  const result = await getUserQuestions({
    userId,
    page: parsePageNumber(searchParams.page),
  });

  return (
    <>
      <div className="mt-2 flex w-full flex-col gap-6">
        {result.questions.map((question) => (
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
            clerkId={clerkId}
          />
        ))}
      </div>
      <div className="mt-10 w-full">
        <Pagination
          pageNumber={parsePageNumber(searchParams.page)}
          hasNextPage={result.hasNextPage}
        />
      </div>
    </>
  );
};

export default QuestionsTab;
