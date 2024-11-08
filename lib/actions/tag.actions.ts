"use server";

import Tag, { ITag } from "@/database/tag.model";
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import { FilterQuery, PipelineStage } from "mongoose";
import Question from "@/database/question.model";

export const getTopInteractedTags = async (
  params: GetTopInteractedTagsParams,
) => {
  try {
    connectToDatabase();
    const { userId } = params;
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // TODO: find all interactions for the user and group them by tags;
    return [
      { _id: "tag1", name: "react" },
      { _id: "tag2", name: "next.js" },
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllTags = async (params: GetAllTagsParams) => {
  try {
    connectToDatabase();
    const { searchQuery, filter } = params;
    const query: FilterQuery<typeof Tag> = {};

    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }

    let sortOptions: PipelineStage[] = [];

    switch (filter) {
      case "popular":
        // Sort by the number of questions (i.e., the length of the questions array)
        sortOptions = [{ $sort: { questionsCount: -1 } }];
        break;
      case "recent":
        sortOptions = [{ $sort: { createdOn: -1 } }];
        break;
      case "name":
        sortOptions = [{ $sort: { name: 1 } }];
        break;
      case "old":
        sortOptions = [{ $sort: { createdOn: 1 } }];
        break;
      default:
        break;
    }

    const tags = await Tag.aggregate([
      { $match: query },
      {
        $addFields: {
          questionsCount: { $size: "$questions" },
        },
      },
      ...sortOptions,
    ]);

    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getQuestionsByTagId = async (
  params: GetQuestionsByTagIdParams,
) => {
  try {
    connectToDatabase();
    const { tagId, searchQuery } = params;

    const tagFilter: FilterQuery<ITag> = { _id: tagId };
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
      match: searchQuery
        ? { title: { $regex: searchQuery, $options: "i" } }
        : {},
      options: {
        sort: { ceratedAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });
    if (!tag) throw new Error("Tag not found!");
    return { questions: tag.questions, tagTitle: tag.name };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getTopPopularTags = async () => {
  try {
    connectToDatabase();
    const popularTags = await Tag.aggregate([
      { $project: { name: 1, numberOfQuestions: { $size: "$questions" } } },
      { $sort: { numberOfQuestions: -1 } },
      { $limit: 5 },
    ]);
    return popularTags;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
