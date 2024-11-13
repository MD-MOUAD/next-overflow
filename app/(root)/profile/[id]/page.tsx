import { Button } from "@/components/ui/button";
import { URLProps } from "@/types";
import { SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { getJoinedDate } from "@/lib/utils";
import ProfileLink from "@/components/shared/ProfileLink";
import Stats from "@/components/shared/Stats";
import QuestionTab from "@/components/shared/QuestionsTab";
import AnswersTab from "@/components/shared/AnswersTab";
import { auth } from "@clerk/nextjs/server";
import { getUserInfo } from "@/lib/actions/user.actions";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const Page = async ({ params, searchParams }: URLProps) => {
  const { userId: clerkId } = auth();
  const userInfo = await getUserInfo({ userId: params.id });

  return (
    <>
      <div className="relative flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <div className="flex shrink-0 items-center gap-3">
            <Dialog>
              <DialogTrigger>
                <Image
                  src={userInfo?.user.picture}
                  alt="profile picture"
                  width={140}
                  height={140}
                  className="size-28 rounded-full object-cover sm:size-[140px]"
                />
              </DialogTrigger>
              <DialogContent className="flex items-center justify-center rounded-lg border-none bg-black p-0">
                <Image
                  src={userInfo?.user.picture}
                  alt="profile picture"
                  width={1000}
                  height={1000}
                  className=" object-cover sm:rounded-lg"
                />
              </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-1 sm:hidden">
              <h2 className="h2-bold text-dark100_light900">
                {userInfo.user.name}
              </h2>
              <p className="paragraph-regular text-dark200_light800">
                @{userInfo.user.username}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex flex-col gap-2 max-sm:hidden">
              <h2 className="h2-bold text-dark100_light900">
                {userInfo.user.name}
              </h2>
              <p className="paragraph-regular text-dark200_light800">
                @{userInfo.user.username}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {userInfo.user.portfolioWebsite && (
                <ProfileLink
                  imgUrl="/assets/icons/link.svg"
                  href={userInfo.user.portfolioWebsite}
                  title="Portfolio"
                />
              )}

              {userInfo.user.location && (
                <ProfileLink
                  imgUrl="/assets/icons/location.svg"
                  title={userInfo.user.location}
                />
              )}

              <ProfileLink
                imgUrl="/assets/icons/calendar.svg"
                title={getJoinedDate(userInfo.user.joinedAt)}
              />
            </div>

            {userInfo.user.bio && (
              <p className="paragraph-regular text-dark400_light800 mt-8">
                {userInfo.user.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end  max-sm:w-full sm:absolute sm:right-0 sm:top-3">
          <SignedIn>
            {clerkId === userInfo.user.clerkId && (
              <Link href="/profile/edit">
                <Button className="paragraph-medium btn-secondary text-dark300_light900 min-h-[46px] min-w-[150px] px-4 py-3 sm:min-w-[175px]">
                  Edit Profile
                </Button>
              </Link>
            )}
          </SignedIn>
        </div>
      </div>

      <Stats
        reputation={userInfo?.user.reputation}
        totalQuestions={userInfo?.totalQuestions}
        totalAnswers={userInfo?.totalAnswers}
        badges={userInfo?.badgeCounts}
      />

      <div className="mt-10 flex gap-10">
        <Tabs defaultValue="top-posts" className="flex-1">
          <TabsList className="background-light800_dark400 min-h-[42px] p-1">
            <TabsTrigger value="top-posts" className="tab">
              Top Posts
            </TabsTrigger>
            <TabsTrigger value="answers" className="tab">
              Answers
            </TabsTrigger>
          </TabsList>
          <TabsContent value="top-posts" className="flex w-full flex-col gap-6">
            <QuestionTab
              searchParams={searchParams}
              userId={userInfo.user._id}
              clerkId={clerkId}
            />
          </TabsContent>
          <TabsContent value="answers" className="flex w-full flex-col gap-6">
            <AnswersTab
              searchParams={searchParams}
              userId={userInfo.user._id}
              clerkId={clerkId}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Page;
