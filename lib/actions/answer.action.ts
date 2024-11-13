"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
} from "./shared.types";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import Interaction from "@/database/interaction.model";
import User from "@/database/user.model";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();

    const { content, author, question, path } = params;

    const newAnswer = await Answer.create({ content, author, question });

    // Add the answer to the question's answers array
    const questionObject = await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    await Interaction.create({
      user: author,
      action: "answer",
      question,
      answer: newAnswer._id,
      tags: questionObject.tags,
    });

    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getAnswers = async (params: GetAnswersParams) => {
  try {
    const { questionId, sortBy, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;
    let sortOptions = {};
    switch (sortBy) {
      case "highestUpvotes":
        sortOptions = { upvoteCount: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvoteCount: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;
      default:
        sortOptions = { upvoteCount: -1 };
        break;
    }

    const answers = await Answer.aggregate([
      // Stage 1: Filter answers by question ID
      { $match: { question: questionId } },

      // Stage 2: Add a new field for counting upvotes
      { $addFields: { upvoteCount: { $size: "$upvotes" } } },

      // Stage 3: Sort by the upvote count or creation date
      { $sort: sortOptions },
      { $skip: skipAmount },
      { $limit: pageSize },

      // Stage 4: Lookup to populate author details
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 1,
                clerkId: 1,
                name: 1,
                picture: 1,
              },
            },
          ],
          as: "authorDetails",
        },
      },

      // Stage 5: Project the fields we want in the result
      {
        $project: {
          content: 1,
          upvoteCount: 1,
          upvotes: 1,
          downvotes: 1,
          createdAt: 1,
          author: { $arrayElemAt: ["$authorDetails", 0] },
        },
      },
    ]);

    const TotalAnswers = await Answer.countDocuments({ question: questionId });

    const hasNextPage = TotalAnswers > skipAmount + answers.length;

    return { answers, hasNextPage };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const upvoteAnswer = async (params: AnswerVoteParams) => {
  try {
    connectToDatabase();
    const { userId, answerId, hasUpvoted, hasDownvoted, path } = params;
    let updateQuery = {};
    if (hasUpvoted) {
      updateQuery = {
        $pull: { upvotes: userId },
      };
    } else if (hasDownvoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });
    if (!answer) throw new Error("answer not found!");

    if (userId !== answer.author) {
      // This check prevent users from manipulating their own reputation

      // Increment user's reputation by +1/-1 for upvoting/revoking an upvote to the answer
      if (!hasDownvoted) {
        await User.findByIdAndUpdate(userId, {
          $inc: { reputation: hasUpvoted ? -1 : 1 },
        });
      }

      // Increment author's reputation by +10/-10 for receiving an upvote/downvote to the answer
      await User.findByIdAndUpdate(answer.author, {
        $inc: { reputation: hasUpvoted ? -10 : hasDownvoted ? 20 : 10 },
      });
    }
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const downvoteAnswer = async (params: AnswerVoteParams) => {
  try {
    connectToDatabase();
    const { userId, answerId, hasUpvoted, hasDownvoted, path } = params;
    let updateQuery = {};
    if (hasDownvoted) {
      updateQuery = {
        $pull: { downvotes: userId },
      };
    } else if (hasUpvoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }
    const answer = await Answer.findByIdAndUpdate(answerId, updateQuery, {
      new: true,
    });
    if (!answer) throw new Error("answer not found!");

    if (userId !== answer.author) {
      if (!hasUpvoted)
        await User.findByIdAndUpdate(userId, {
          $inc: { reputation: hasDownvoted ? -1 : 1 },
        });

      await User.findByIdAndUpdate(answer.author, {
        $inc: { reputation: hasDownvoted ? 10 : hasUpvoted ? -20 : -10 },
      });
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteAnswer = async (params: DeleteAnswerParams) => {
  try {
    connectToDatabase();
    const { answerId, path } = params;

    // get the answer object to pull its id from its related question answers array
    const answer = await Answer.findById(answerId);
    if (!answer) throw new Error("Answer not found");
    await Answer.deleteOne({ _id: answerId });
    await Question.updateOne(
      { _id: answer.question },
      { $pull: { answers: answerId } },
    );
    await Interaction.deleteMany({ answer: answerId });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
