"use server";

import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";

export const cerateQuestion = async (params: CreateQuestionParams) => {
  try {
    connectToDatabase();
    const { title, content, tags, author, path } = params;

    const newQuestion = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];
    // Create the tags or get them if they already exist

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        // Check if a tag with the same name (case-insensitive) exists
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        // If the tag exists, push the new question's ID into the Tag.questions array
        // If it doesn't exist, create a new tag with the given name (upsert operation)
        {
          $push: { questions: newQuestion._id },
          $setOnInsert: { name: tag },
        },
        { upsert: true, new: true },
      );
      tagDocuments.push(existingTag._id);
    }
    await Question.findByIdAndUpdate(newQuestion._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    revalidatePath(path);

    // Increment author's reputation by +5 for creating a question
    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });
    // TODO: increment authors reputation by +5 points for creating a question.
  } catch (error) {
    console.log(error);
  }
};

export const getQuestions = async (params: GetQuestionsParams) => {
  try {
    connectToDatabase();

    const { filter } = params;
    let sortOptions = {};

    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "frequent":
        sortOptions = { views: -1 };
        break;
      // case "unanswered":
      //   query.answers = { $size: 0 }
      //   break;
      default:
        break;
    }

    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort(sortOptions);
    return { questions };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getQuestionById = async (params: GetQuestionByIdParams) => {
  try {
    connectToDatabase();
    const { questionId } = params;
    const question = await Question.findById(questionId)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      });

    return question;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const upvoteQuestion = async (params: QuestionVoteParams) => {
  try {
    connectToDatabase();
    const { userId, questionId, hasUpvoted, hasDownvoted, path } = params;
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
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });
    if (!question) throw new Error("question not found!");

    // TODO: increment author's reputation by +10
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const downvoteQuestion = async (params: QuestionVoteParams) => {
  try {
    connectToDatabase();
    const { userId, questionId, hasUpvoted, hasDownvoted, path } = params;
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
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });
    if (!question) throw new Error("question not found!");

    // TODO: increment author's reputation by +10
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
