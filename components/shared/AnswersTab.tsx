import { getUserAnswers } from "@/lib/actions/user.actions";
import { SearchParamsProps } from "@/types";
import React from "react";
import AnswerCard from "../cards/AnswerCard";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const QuestionsTab = async ({ searchParams, userId, clerkId }: Props) => {
  const result = await getUserAnswers({ userId });

  return (
    <div className="mt-10 flex w-full flex-col gap-6">
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
  );
};

export default QuestionsTab;
