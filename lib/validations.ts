import { z } from "zod";

export const QuestionsSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long." })
    .max(130, { message: "Title must be at most 130 characters long." }),

  explanation: z
    .string()
    .min(100, { message: "Explanation must be at least 100 characters long." }),

  tags: z
    .array(
      z
        .string()
        .min(1, { message: "Tag must be at least 1 character long." })
        .max(15, { message: "Tag must be at most 15 characters long." }),
    )
    .min(1, { message: "You must provide at least 1 tag." })
    .max(3, { message: "You can only provide up to 3 tags." }),
});
