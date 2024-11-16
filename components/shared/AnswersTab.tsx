import { getUserAnswers } from "@/lib/actions/user.actions";
import { SearchParamsProps } from "@/types";
import React from "react";
import AnswerCard from "../cards/AnswerCard";
import Pagination from "./Pagination";
import { parsePageNumber } from "@/lib/utils";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}
const QuestionsTab = async ({ searchParams, userId, clerkId }: Props) => {
  const result = await getUserAnswers({
    userId,
    page: parsePageNumber(searchParams.page),
  });

  return (
    <>
      <div className="mt-2 flex w-full flex-col gap-6">
        {result.answers.map((answer) => (
          <AnswerCard
            key={answer._id}
            _id={answer._id}
            author={answer.author}
            question={answer.question}
            questioner={answer.question.author}
            upvotes={answer.upvotes.length}
            createdAt={answer.createdAt}
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
