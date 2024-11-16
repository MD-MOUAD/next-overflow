"use server";

import { connectToDatabase } from "../mongoose";
import { SearchParams } from "./shared.types";
import Answer from "@/database/answer.model";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import User from "@/database/user.model";

const SearchableTypes = ["question", "answer", "user", "tag"];

export const globalSearch = async (params: SearchParams) => {
  try {
    connectToDatabase();
    const { query, type } = params;
    const escapedQuery = query?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regexQuery = { $regex: escapedQuery, $options: "i" };

    let results = [];
    const modelsAndTypes = [
      { model: Question, searchField: "title", type: "question", idKey: "_id" },
      { model: User, searchField: "name", type: "user", idKey: "clerkId" },
      { model: Answer, searchField: "content", type: "answer", idKey: "_id" },
      { model: Tag, searchField: "name", type: "tag", idKey: "_id" },
    ];

    const typeLower = type?.toLowerCase();
    if (!typeLower || !SearchableTypes.includes(typeLower)) {
      for (const { model, searchField, type, idKey } of modelsAndTypes) {
        const queryResults = await model
          .find({ [searchField]: regexQuery })
          .limit(2);

        results.push(
          ...queryResults.map((result) => ({
            title:
              type === "answer"
                ? `answers containing '${query}'`
                : result[searchField],
            id:
              type === "answer"
                ? `${result.question}#${JSON.stringify(result[idKey])}`
                : result[idKey],
            type,
          })),
        );
      }
    } else {
      // Search for the specify type
      const modelInfo = modelsAndTypes.find((item) => item.type === typeLower);

      if (!modelInfo) throw new Error("invalid search type");

      const queryResults = await modelInfo.model
        .find({ [modelInfo.searchField]: regexQuery })
        .limit(8);

      results = queryResults.map((result) => ({
        title:
          typeLower === "answer"
            ? `answers containing '${query}'`
            : result[modelInfo.searchField],
        id:
          typeLower === "answer"
            ? `${result.question}#${result[modelInfo.idKey]}`
            : result[modelInfo.idKey],
        type: typeLower,
      }));
    }
    return JSON.stringify(results);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
