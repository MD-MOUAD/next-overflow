import React from "react";
import Filter from "./Filter";
import { AnswerFilters } from "@/constants/filters";
import { getAnswers } from "@/lib/actions/answer.action";
import Link from "next/link";
import Image from "next/image";
import { getTimestamp } from "@/lib/utils";
import ParseHTML from "./ParseHtml";
import Votes from "./Votes";
import mongoose from "mongoose";
import Pagination from "./Pagination";

interface PropsType {
  questionId: string;
  userId: string;
  totalAnswers: number;
  page: number;
  filter?: string;
}

const AllAnswers = async (props: PropsType) => {
  const { questionId, totalAnswers, userId, filter, page } = props;
  const { answers, hasNextPage } = await getAnswers({
    questionId,
    sortBy: filter,
    page,
  });

  const hasUserVoted = (
    votes: mongoose.Types.ObjectId[],
    userId: mongoose.Types.ObjectId,
  ): boolean => {
    return votes.some((vote) => vote.equals(userId));
  };

  const userObjectId = new mongoose.Types.ObjectId(userId);

  return (
    <div className="my-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{`${totalAnswers} Answer${totalAnswers !== 1 ? "s" : ""}`}</h3>

        {totalAnswers > 0 && (
          <Filter filters={AnswerFilters} otherClasses="min-w-[170px]" />
        )}
      </div>

      <div>
        {answers.map((answer) => {
          const hasUpvoted = hasUserVoted(answer.upvotes, userObjectId);
          const hasDownvoted = hasUserVoted(answer.downvotes, userObjectId);
          return (
            <article
              key={JSON.stringify(answer._id)}
              id={JSON.stringify(answer._id)}
              className="light-border border-b py-10"
            >
              <div className="mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                <Link
                  href={`/profile/${answer.author.clerkId}`}
                  className="flex flex-1 items-start gap-1 sm:items-center"
                >
                  <Image
                    src={answer.author.picture}
                    width={18}
                    height={18}
                    alt="profile"
                    className="size-5 rounded-full object-cover max-sm:mt-0.5"
                  />
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className="body-semibold text-dark300_light700">
                      {answer.author.name}
                      &nbsp;
                    </p>

                    <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
                      answered {getTimestamp(answer.createdAt)}
                    </p>
                  </div>
                </Link>

                <div className="flex justify-end">
                  <Votes
                    type="Answer"
                    itemId={JSON.stringify(answer._id)}
                    userId={JSON.stringify(userId)}
                    upvotes={answer.upvotes.length}
                    downvotes={answer.downvotes.length}
                    hasUpvoted={hasUpvoted}
                    hasDownvoted={hasDownvoted}
                  />
                </div>
              </div>
              <ParseHTML data={answer.content} />
            </article>
          );
        })}
      </div>
      <div className="mt-10 w-full">
        <Pagination pageNumber={page} hasNextPage={hasNextPage} />
      </div>
    </div>
  );
};

export default AllAnswers;
