"use server";

import Tag from "../database/tag.model";
import User from "../database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetAllTagsParams, GetTopInteractedTagsParams } from "./shared.types";

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getAllTags = async (params: GetAllTagsParams) => {
  try {
    connectToDatabase();
    // const { filter } = params;
    const tags = await Tag.find({});

    return { tags };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
