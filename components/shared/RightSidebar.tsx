import Image from "next/image";
import Link from "next/link";
import React from "react";
import RenderTag from "./RenderTag";
import { getAllTags } from "@/lib/actions/tag.actions";
import { getQuestions } from "@/lib/actions/question.actions";

const RightSidebar = async () => {
  const { questions } = await getQuestions({});
  const { tags } = await getAllTags({}); // todo test

  return (
    <section className="background-light900_dark200 light-border no-scrollbar sticky right-0 top-0 flex h-screen w-[350px] flex-col overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div className="">
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
      </div>
      <div className="mt-7 flex w-full flex-col gap-[30px]">
        {questions.map((question, i) => {
          return i < 5 && (
            <Link
              href={`/questions/${question._id}`}
              key={question._id}
              className="flex cursor-pointer items-center justify-between gap-7"
            >
              <p className="body-medium text-dark500_light700">
                {question.title}
              </p>
              <Image
                src="/assets/icons/chevron-right.svg"
                alt="chevron-right"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          );
        })}
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {tags.map((tag, i) => {
            return (
              i < 5 && (
                <RenderTag
                  key={tag._id}
                  _id={tag._id}
                  name={tag.name}
                  totalQuestions={tag.questions.length}
                  showCount={true}
                />
              )
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
