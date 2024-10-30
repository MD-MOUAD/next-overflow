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
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import { FilterQuery } from "mongoose";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getAllUsers = async (params: GetAllUsersParams) => {
  try {
    connectToDatabase();
    // const { page = 1, pageSize = 20, filter, searchQuery } = params;
    const users = await User.find({}).find({ createdAt: -1 });
    return { users };
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
    const { clerkId, searchQuery } = params;

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};
    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: { ceratedAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });
    if (!user) throw new Error("User not found!");
    return { savedQuestions: user.saved };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
// copy and past:
// export const name = async (params: paramsTypes) => {
//   try {
//     connectToDatabase();
//   } catch (error) {
//     console.log(error);
//     throw error
//   }
// };
