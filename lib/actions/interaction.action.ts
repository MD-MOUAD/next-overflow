"use server";
import Question from "@/database/question.model";
import Interaction from "@/database/interaction.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";

export const viewQuestion = async (params: ViewQuestionParams) => {
  try {
    connectToDatabase();
    const { questionId, userId } = params;

    
    if (userId) {
      const existingInteraction = await Interaction.findOne({
        user: userId,
        action: "view",
        question: questionId,
      });
      if (existingInteraction) {
        return console.log("User has already viewed.");
      }
      await Interaction.create({
        user: userId,
        action: "view",
        question: questionId,
      });
      // update view count for the question
      await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
