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

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();

    const { content, author, question, path } = params;

    const newAnswer = await Answer.create({ content, author, question });

    // Add the answer to the question's answers array
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    // TODO: do some Interactions

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getAnswers = async (params: GetAnswersParams) => {
  try {
    const { questionId, sortBy } = params;
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

    return { answers };
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

    // TODO: increment author's reputation by +10
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

    // TODO: increment author's reputation by +10
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
