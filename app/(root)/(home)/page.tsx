import QuestionCard from "@/components/cards/QuestionCard";
import HomeFilters from "@/components/home/HomeFilters";
import Filter from "@/components/shared/Filter";
import NoResult from "@/components/shared/NoResult";
import LocalSearchbar from "@/components/shared/search/LocalSearchbar";
import { Button } from "@/components/ui/button";
import { HomePageFilters } from "@/constants/filters";
import Link from "next/link";

const questions = [
  {
    _id: "1",
    title:
      "What are the differences between functional and class components in React?",
    tags: [
      { _id: "t5", name: "React" },
      { _id: "t6", name: "Components" },
    ],
    author: {
      _id: "a2",
      name: "Mouad Khanouch",
      picture: "https://avatars.githubusercontent.com/u/125469605?v=4",
      clerkId: "MouadID",
    },
    upvotes: ["user5", "user6", "user7"],
    views: 690,
    answers: [{}],
    createdAt: new Date("2024-09-15"),
    clerkId: null,
  },
  {
    _id: "2",
    title: "How do I implement authentication in Next.js?",
    tags: [
      { _id: "t1", name: "Next.js" },
      { _id: "t2", name: "Authentication" },
    ],
    author: {
      _id: "a1",
      name: "John Doe",
      picture:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo_R_vlnUz9UhylMPCccagw4dMqhbs4UMPAA&s",
      clerkId: "AlexID",
    },
    upvotes: ["user1", "user2"],
    views: 152000,
    answers: [],
    createdAt: new Date("2024-09-01"),
    clerkId: "clerk123",
  },
  {
    _id: "3",
    title: "How to fetch data in React using useEffect?",
    tags: [
      { _id: "t3", name: "React" },
      { _id: "t4", name: "Hooks" },
    ],
    author: {
      _id: "a3",
      name: "Alex Smith",
      picture:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkhxsi-ft_LrsZ5eANW_uJWdzPNU41QOYxUA&s",
      clerkId: "AlexID",
    },
    upvotes: ["user4"],
    views: 3500502,
    answers: [{}],
    createdAt: new Date("2023-10-01"),
    clerkId: null,
  },
];

const Home = () => {
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href="/ask-question" className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900">
            Ask a Question
          </Button>
        </Link>
      </div>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchbar
          // route='/' //TODO
          iconPosition="left"
          imgSrc="/assets/icons/search.svg"
          placeholder="Search questions..."
          otherClasses="flex-1"
        />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>
      <HomeFilters />
      <div className="mt-10 flex w-full flex-col gap-6">
        {questions.length > 0 ? (
          questions.map((question) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There’s no question to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
};
export default Home;
