import { getUserQuestions } from "@/lib/actions/user.actions";
import { SearchParamsProps } from "@/types";
import React from "react";
import QuestionCard from "../cards/QuestionCard";

interface Props extends SearchParamsProps {
  userId: string;
  clerkId?: string | null;
}
const QuestionsTab = async ({ searchParams, userId, clerkId }: Props) => {
  const result = await getUserQuestions({ userId });

  return (
    <div className="mt-10 flex w-full flex-col gap-6">
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
  );
};

export default QuestionsTab;
