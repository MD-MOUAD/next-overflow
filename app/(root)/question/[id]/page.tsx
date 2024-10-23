import { getQuestionById } from "@/lib/actions/question.actions";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatAndDivideNumber, getTimestamp } from "@/lib/utils";
import Metric from "@/components/shared/Metric";
import ParseHtml from "@/components/shared/ParseHtml";

const Page = async ({ params }: { params: { id: string } }) => {
  const question = await getQuestionById({ questionId: params.id });
  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2 ">
          <Link
            href={`profile/${question.author.clerkId}`}
            className="flex items-center justify-start gap-1"
          >
            <Image
              src={question.author.picture}
              width={22}
              height={22}
              alt="profile"
              className="rounded-full"
            />
            <p className="paragraph-semibold text-dark300_light700">
              {question.author.name}
            </p>
          </Link>
          <div className="flex justify-end">VOTING</div>
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
    </>
  );
};

export default Page;
