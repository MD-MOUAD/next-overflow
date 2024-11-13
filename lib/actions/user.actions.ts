/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
"use server";
import { revalidatePath } from "next/cache";
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import { FilterQuery } from "mongoose";
import Answer from "@/database/answer.model";

export async function getUserById(params: GetUserByIdParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();
    const { clerkId, updateData, path } = params;
    await User.findOneAndUpdate({ clerkId }, updateData, { new: true });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();
    const { clerkId } = params;
    const user = await User.findOne({ clerkId });

    if (!user) {
      throw new Error("User Not Found");
    }

    // delete user questions
    await Question.deleteMany({ author: user._id });

    // TODO delete everything related to the user like answers comments etc...

    // get user question ids
    // const questionIds = await Question.find({ author: user._id }).distinct(
    //   "_id",
    // );
    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getAllUsers = async (params: GetAllUsersParams) => {
  try {
    connectToDatabase();
    const { filter, searchQuery, page = 1, pageSize = 20 } = params;
    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof User> = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {};
    switch (filter) {
      case "old_users":
        sortOptions = { joinedAt: 1 };
        break;
      case "new_users":
        sortOptions = { joinedAt: -1 };
        break;
      case "top_contributors":
        sortOptions = { reputation: -1 };
        break;

      default:
        break;
    }

    const users = await User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsers = await User.countDocuments(query);
    const hasNextPage: boolean = totalUsers > skipAmount + users.length;

    return { users, hasNextPage };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const ToggleSaveQuestion = async (params: ToggleSaveQuestionParams) => {
  try {
    connectToDatabase();
    const { userId, questionId, path } = params;

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found!");

    const isQuestionSaved = user.saved.includes(questionId);
    const updateQuery = isQuestionSaved
      ? { $pull: { saved: questionId } } // remove question from saved
      : { $addToSet: { saved: questionId } }; // add question to saved

    await User.findByIdAndUpdate(userId, updateQuery, { new: true });
    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getSavedQuestions = async (params: GetSavedQuestionsParams) => {
  try {
    connectToDatabase();
    const { clerkId, searchQuery, filter, page = 1, pageSize = 20 } = params;
    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    let sortOptions = {};
    switch (filter) {
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;
      case "most_voted":
        sortOptions = { upvotes: -1 };
        break;
      case "most_viewed":
        sortOptions = { views: -1 };
        break;
      case "most_answered":
        sortOptions = { answers: -1 };
        break;

      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });
    if (!user) throw new Error("User not found!");

    const hasNextPage: boolean = user.saved.length > pageSize;
    if (hasNextPage) {
      user.saved.pop();
    }
    return { savedQuestions: user.saved, hasNextPage };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserInfo = async (params: GetUserByIdParams) => {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("User not found");
    }
    const totalQuestions = await Question.countDocuments({ author: user?._id });
    const totalAnswers = await Answer.countDocuments({ author: user?._id });
    return {
      user,
      totalQuestions,
      totalAnswers,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserQuestions = async (params: GetUserStatsParams) => {
  try {
    connectToDatabase();
    const { userId, page = 1, pageSize = 10 } = params;
    const skipAmount = (page - 1) * pageSize;

    const totalQuestions = await Question.countDocuments({ author: userId });

    const userQuestions = await Question.find({ author: userId })
      .sort({ views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("tags", "_id name")
      .populate("author", "_id name picture clerkId ");

    const hasNextPage = totalQuestions > skipAmount + userQuestions.length;

    return { questions: userQuestions, totalQuestions, hasNextPage };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserAnswers = async (params: GetUserStatsParams) => {
  try {
    connectToDatabase();
    const { userId, page = 1, pageSize = 10 } = params;
    const totalAnswers = await Answer.countDocuments({ author: userId });
    const skipAmount = (page - 1) * pageSize;

    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({
        path: "question",
        select: "_id title",
        populate: {
          path: "author", // Populate the author of the question
          select: "name picture clerkId",
        },
      })
      .populate("author", "clerkId");

    const hasNextPage = totalAnswers > skipAmount + userAnswers.length;

    return { answers: userAnswers, totalAnswers, hasNextPage };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
