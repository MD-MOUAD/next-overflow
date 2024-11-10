"use client";
import { downvoteAnswer, upvoteAnswer } from "@/lib/actions/answer.action";
import { viewQuestion } from "@/lib/actions/interaction.action";
import {
  downvoteQuestion,
  upvoteQuestion,
} from "@/lib/actions/question.actions";
import { ToggleSaveQuestion } from "@/lib/actions/user.actions";
import { formatAndDivideNumber } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

interface PropsTypes {
  type: string;
  itemId: string;
  userId: string;
  upvotes: number;
  downvotes: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  hasSaved?: boolean;
}
const Votes = ({
  type,
  itemId,
  userId,
  upvotes,
  downvotes,
  hasUpvoted,
  hasDownvoted,
  hasSaved,
}: PropsTypes) => {
  const pathname = usePathname();
  const handleSave = async () => {
    if (!userId) {
      return;
    }
    await ToggleSaveQuestion({
      userId: JSON.parse(userId),
      questionId: JSON.parse(itemId),
      path: pathname,
    });
  };
  const handleVote = async (action: string) => {
    if (!userId) {
      return;
    }
    const sharedVoteParams = {
      userId: JSON.parse(userId),
      hasUpvoted,
      hasDownvoted,
      path: pathname,
    };
    const questionVoteParams = {
      ...sharedVoteParams,
      questionId: JSON.parse(itemId),
    };
    const AnswerVoteParams = {
      ...sharedVoteParams,
      answerId: JSON.parse(itemId),
    };
    if (action === "upvote") {
      if (type === "Question") {
        await upvoteQuestion(questionVoteParams);
      } else if (type === "Answer") {
        await upvoteAnswer(AnswerVoteParams);
      }
      // Todo: show a toast
      return;
    }
    if (action === "downvote") {
      if (type === "Question") {
        await downvoteQuestion(questionVoteParams);
      } else if (type === "Answer") {
        await downvoteAnswer(AnswerVoteParams);
      }
      // Todo: show a toast
    }
  };

  useEffect(() => {
    if (type === "Question") {
      viewQuestion({
        questionId: JSON.parse(itemId),
        userId: userId ? JSON.parse(userId) : undefined,
      });
    }
  }, [itemId, userId, pathname, type]);

  return (
    <div className="flex gap-4">
      <div className="flex-center gap-2.5">
        {/* upvotes */}
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasUpvoted
                ? "/assets/icons/upvoted.svg"
                : "/assets/icons/upvote.svg"
            }
            width={18}
            height={18}
            alt="upvote"
            className="cursor-pointer"
            onClick={() => handleVote("upvote")}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="text-dark400_light900 subtle-medium">
              {formatAndDivideNumber(upvotes)}
            </p>
          </div>
        </div>
        {/* downvotes */}
        <div className="flex-center gap-1.5">
          <Image
            src={
              hasDownvoted
                ? "/assets/icons/downvoted.svg"
                : "/assets/icons/downvote.svg"
            }
            width={18}
            height={18}
            alt="downvote"
            className="cursor-pointer"
            onClick={() => handleVote("downvote")}
          />
          <div className="flex-center background-light700_dark400 min-w-[18px] rounded-sm p-1">
            <p className="text-dark400_light900 subtle-medium">
              {formatAndDivideNumber(downvotes)}
            </p>
          </div>
        </div>
      </div>
      {type === "Question" && (
        <Image
          src={
            hasSaved
              ? "/assets/icons/star-filled.svg"
              : "/assets/icons/star-red.svg"
          }
          width={18}
          height={18}
          alt="star"
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Votes;
