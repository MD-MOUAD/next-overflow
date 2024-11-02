"use client";
import { sidebarLinks } from "@/constants";
import { SignedIn, SignedOut, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import SidebarLink from "./SidebarLink";

const LeftSidebar = () => {
  const { userId } = useAuth();

  return (
    <section className="background-light900_dark200 light-border no-scrollbar sticky left-0 top-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[266px]">
      <div className="flex flex-col gap-6">
        {sidebarLinks.map((item) => {
          return (
            <div key={item.route}>
              <SidebarLink
                route={item.route}
                imgURL={item.imgURL}
                label={item.label}
              />
            </div>
          );
        })}
        <SignedIn>
          <SidebarLink
            route={`/profile/${userId}`}
            imgURL="/assets/icons/user.svg"
            label="Profile"
          />
        </SignedIn>
      </div>
      <div className="mt-5">
        <SignedOut>
          <div className="flex flex-col gap-3">
            <Link href="/sign-in">
              <Button className="btn-secondary min-h-[41px] w-full rounded-lg px-4 py-3 font-semibold shadow-none">
                <Image
                  src="/assets/icons/account.svg"
                  alt="login"
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="primary-text-gradient max-lg:hidden">
                  Log In
                </span>
              </Button>
            </Link>

            <Link href="/sign-up">
              <Button className="light-border-2 btn-tertiary text-dark400_light900 min-h-[41px] w-full rounded-lg border px-4 py-3 font-semibold shadow-none">
                <Image
                  src="/assets/icons/sign-up.svg"
                  alt="login"
                  width={20}
                  height={20}
                  className="invert-colors lg:hidden"
                />
                <span className="max-lg:hidden">Sign Up</span>
              </Button>
            </Link>
          </div>
        </SignedOut>
      </div>
    </section>
  );
};

export default LeftSidebar;
