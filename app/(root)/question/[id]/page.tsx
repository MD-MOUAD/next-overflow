import { getQuestionById } from "@/lib/actions/question.actions";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  formatAndDivideNumber,
  getTimestamp,
  parsePageNumber,
} from "@/lib/utils";
import Metric from "@/components/shared/Metric";
import ParseHtml from "@/components/shared/ParseHtml";
import RenderTag from "@/components/shared/RenderTag";
import Answer from "@/components/forms/Answer";
import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/actions/user.actions";
import AllAnswers from "@/components/shared/AllAnswers";
import Votes from "@/components/shared/Votes";
import { URLProps } from "@/types";

const Page = async ({ params, searchParams }: URLProps) => {
  const question = await getQuestionById({ questionId: params.id });
  const { userId: clerkId } = auth();
  let mongoUser;
  if (clerkId) {
    mongoUser = await getUserById({ userId: clerkId });
  }
  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2 ">
          <Link
            href={`/profile/${question.author.clerkId}`}
            className="flex items-center justify-start gap-1"
          >
            <Image
              src={question.author.picture}
              width={22}
              height={22}
              alt="profile"
              className="size-[22px] rounded-full object-cover"
            />
            <p className="paragraph-semibold text-dark300_light700">
              {question.author.name}
            </p>
          </Link>
          <div className="flex justify-end">
            <Votes
              type="Question"
              itemId={JSON.stringify(question._id)}
              userId={JSON.stringify(mongoUser?._id)}
              upvotes={question.upvotes.length}
              downvotes={question.downvotes.length}
              hasUpvoted={question.upvotes.includes(mongoUser?._id)}
              hasDownvoted={question.downvotes.includes(mongoUser?._id)}
              hasSaved={mongoUser?.saved.includes(question._id)}
            />
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          {question.title}
        </h2>
      </div>
      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/assets/icons/clock.svg"
          alt="clock icon"
          value={` Asked ${getTimestamp(question.createdAt)}`}
          title=""
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/message.svg"
          alt="message"
          value={formatAndDivideNumber(question.answers.length)}
          title={`Answer${question.answers.length !== 1 ? "s" : ""}`}
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/assets/icons/eye.svg"
          alt="eye"
          value={formatAndDivideNumber(question.views)}
          title={`View${question.views !== 1 ? "s" : ""}`}
          textStyles="small-medium text-dark400_light800"
        />
      </div>
      <ParseHtml data={question.content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          question.tags.map((tag: any) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              showCount={false}
            />
          ))
        }
      </div>

      <AllAnswers
        questionId={question?._id}
        userId={mongoUser?._id}
        totalAnswers={question?.answers.length}
        filter={searchParams?.filter}
        page={parsePageNumber(searchParams.page)}
      />
      <Answer
        question={question?.content}
        questionId={JSON.stringify(question?._id)}
        authorId={JSON.stringify(mongoUser?._id)}
      />
    </>
  );
};

export default Page;
