"use server";

import User from "../database/user.model";
import { connectToDatabase } from "../mongoose";
import { GetTopInteractedTagsParams } from "./shared.types";

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
