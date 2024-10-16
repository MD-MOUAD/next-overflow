"use client";
import { sidebarLinks } from "@/constants";
import { SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";

const LeftSidebar = () => {
  const pathname = usePathname();

  // TODO
  return (
    <section className="background-light900_dark200 light-border no-scrollbar sticky left-0 top-0 flex h-screen flex-col justify-between overflow-y-auto border-r p-6 pt-36 shadow-light-300 dark:shadow-none max-sm:hidden lg:w-[266px]">
      <div className="flex flex-col gap-6">
        {sidebarLinks.map((item) => {
          const isActive =
            (pathname.includes(item.route) && item.route.length > 1) ||
            pathname === item.route;

          return (
            <div key={item.route}>
              <Link
                href={item.route}
                className={`${
                  isActive
                    ? "primary-gradient rounded-lg text-light-900"
                    : "text-dark300_light900 bg-transparent "
                } flex items-center justify-start gap-4 p-4`}
              >
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  width={20}
                  height={20}
                  className={`${isActive ? "" : "invert-colors"}`}
                />
                <p
                  className={`${isActive ? "base-bold" : "base-medium"} max-lg:hidden`}
                >
                  {item.label}
                </p>
              </Link>
            </div>
          );
        })}
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
