"use server";
import Question from "@/database/question.model";
import Interaction from "@/database/interaction.model";
import { connectToDatabase } from "../mongoose";
import { ViewQuestionParams } from "./shared.types";
import User from "@/database/user.model";

export const viewQuestion = async (params: ViewQuestionParams) => {
  const VIEW_DELAY = 10 * 60 * 1000;
  try {
    connectToDatabase();
    const { questionId, userId } = params;
    const now = new Date();

    if (userId) {
      const existingInteraction = await Interaction.findOne({
        user: userId,
        action: "view",
        question: questionId,
      });
      if (existingInteraction) {
        const timeSinceLastView =
          now.getTime() - existingInteraction.updatedAt.getTime();
        if (timeSinceLastView < VIEW_DELAY) {
          // Do not increment the view count if viewed within the delay period
          return;
        }
        existingInteraction.updatedAt = now;
        await existingInteraction.save();
      } else {
        const interaction = await Interaction.create({
          user: userId,
          action: "view",
          question: questionId,
        });
        // add view interaction to user interactions
        await User.findByIdAndUpdate(userId, {
          $addToSet: { interactions: interaction?._id },
        });
      }
      // Increment the view count for the question
      await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};
