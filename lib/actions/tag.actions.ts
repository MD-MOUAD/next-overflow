"use server";

import Tag, { ITag } from "@/database/tag.model";
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  GetAllTagsParams,
  GetQuestionsByTagIdParams,
  GetTopInteractedTagsParams,
} from "./shared.types";
import { FilterQuery } from "mongoose";
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
    const { searchQuery, filter, page = 1, pageSize = 20 } = params;
    const skipAmount = (page - 1) * pageSize;
    const query: FilterQuery<typeof Tag> = {};

    if (searchQuery) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }

    let sortOptions = {};

    switch (filter) {
      case "popular":
        // Sort by the number of questions (i.e., the length of the questions array)
        sortOptions = { questionsCount: -1 };
        break;
      case "recent":
        sortOptions = { createdOn: -1 };
        break;
      case "name":
        sortOptions = { name: 1 };
        break;
      case "old":
        sortOptions = { createdOn: 1 };
        break;
      default:
        sortOptions = { questionsCount: -1 };
        break;
    }

    const tags = await Tag.aggregate([
      { $match: query },
      {
        $addFields: {
          questionsCount: { $size: "$questions" },
        },
      },
      { $sort: sortOptions },
      { $skip: skipAmount },
      { $limit: pageSize },
    ]);

    const totalTags = await Tag.countDocuments(query);
    const hasNextPage: boolean = totalTags > skipAmount + tags.length;

    return { tags, hasNextPage };
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
    const { tagId, searchQuery, filter, page = 1, pageSize = 20 } = params;
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
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "most_viewed":
        sortOptions = { views: -1 };
        break;
      case "most_voted":
        sortOptions = { upvotes: 1 };
        break;
      case "most_answered":
        sortOptions = { answers: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const tagFilter: FilterQuery<ITag> = { _id: tagId };
    const tag = await Tag.findOne(tagFilter).populate({
      path: "questions",
      model: Question,
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
    if (!tag) throw new Error("Tag not found!");

    const hasNextPage = tag.questions.length > pageSize;
    if (hasNextPage) {
      tag.questions.pop();
    }
    return { questions: tag.questions, tagTitle: tag.name, hasNextPage };
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
