"use server";

import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
} from "./shared.types";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import { FilterQuery } from "mongoose";

export const cerateQuestion = async (params: CreateQuestionParams) => {
  try {
    connectToDatabase();
    const { title, content, tags, author, path } = params;

    // Create the question
    const newQuestion = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];
    // Create the tags or get them if they already exist

    for (const tag of tags) {
      const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existingTag = await Tag.findOneAndUpdate(
        // Check if a tag with the same name exists
        { name: { $regex: new RegExp(`^${escapedTag}$`, "i") } },
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

    // Create an interaction record for the user's ask_question action
    await Interaction.create({
      user: author,
      action: "ask_question",
      question: newQuestion._id,
      tags: tagDocuments,
    });

    // Increment author's reputation by +10 for creating a question
    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });
  } catch (error) {
    console.log(error);
  }
};

export const getQuestions = async (params: GetQuestionsParams) => {
  try {
    connectToDatabase();

    const { filter, searchQuery, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = {};

    if (searchQuery) {
      const escapedSearchQuery = searchQuery.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      query.$or = [
        { title: { $regex: new RegExp(escapedSearchQuery, "i") } },
        { content: { $regex: new RegExp(escapedSearchQuery, "i") } },
      ];
    }
    let sortOptions = {};

    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "frequent":
        sortOptions = { views: -1 };
        break;
      case "unanswered":
        query.answers = { $size: 0 };
        break;
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const questions = await Question.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User });

    const totalQuestions = await Question.countDocuments(query);

    const hasNextPage: boolean = totalQuestions > skipAmount + questions.length;
    return { questions, hasNextPage };
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

    if (userId !== question.author) {
      // This check prevent users from manipulating their own reputation

      // Increment user's reputation by +1/-1 for upvoting/revoking an upvote to the question
      if (!hasDownvoted) {
        await User.findByIdAndUpdate(userId, {
          $inc: { reputation: hasUpvoted ? -1 : 1 },
        });
      }

      // Increment author's reputation by +10/-10 for receiving an upvote/downvote to the question
      await User.findByIdAndUpdate(question.author, {
        $inc: { reputation: hasUpvoted ? -10 : hasDownvoted ? 20 : 10 },
      });
    }
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

    if (userId !== question.author) {
      if (!hasUpvoted)
        await User.findByIdAndUpdate(userId, {
          $inc: { reputation: hasDownvoted ? -1 : 1 },
        });

      await User.findByIdAndUpdate(question.author, {
        $inc: { reputation: hasDownvoted ? 10 : hasUpvoted ? -20 : -10 },
      });
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteQuestion = async (params: DeleteQuestionParams) => {
  try {
    connectToDatabase();
    const { questionId, path } = params;

    await Question.deleteOne({ _id: questionId });
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });
    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } },
    );

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const editQuestion = async (params: EditQuestionParams) => {
  try {
    connectToDatabase();
    const { questionId, title, content, path } = params;

    const question = await Question.findByIdAndUpdate(
      questionId,
      { title, content },
      { new: true },
    );
    if (!question) throw new Error("Question not found!");

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getHotQuestions = async () => {
  try {
    connectToDatabase();
    const hotQuestions = await Question.find({})
      .sort({
        views: -1,
        upvotes: -1,
      })
      .limit(5);

    return hotQuestions;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
