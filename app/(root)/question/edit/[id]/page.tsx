import Question from "@/components/forms/Question";
import { getQuestionById } from "@/lib/actions/question.actions";
import { getUserById } from "@/lib/actions/user.actions";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async ({ params }: ParamsProps) => {
  const { userId } = auth();
  if (!userId) return null;
  const mongoUser = await getUserById({ userId });
  const question = await getQuestionById({ questionId: params.id });

  if (userId !== question.author.clerkId) {
    // TODO toast
    console.log("not allowed");
    redirect("/");
  }
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>
      <div className="mt-9">
        <Question
          type="edit"
          mongoUserId={JSON.stringify(mongoUser?._id)}
          questionDetails={JSON.stringify(question)}
        />
      </div>
    </>
  );
};

export default Page;
