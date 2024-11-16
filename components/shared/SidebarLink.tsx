import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface Props {
  route: string;
  imgURL: string;
  label: string;
}
const SidebarLink = ({ route, imgURL, label }: Props) => {
  const pathname = usePathname();
  const isActive =
    (pathname.includes(route) && route.length > 1) || pathname === route;
  return (
    <Link
      href={route}
      className={`${
        isActive
          ? "primary-gradient text-light-900"
          : "text-dark300_light900 hover:background-light700_dark400"
      } flex items-center justify-start gap-4 rounded-lg bg-transparent p-4`}
    >
      <Image
        src={imgURL}
        alt={label}
        width={20}
        height={20}
        className={`${isActive ? "" : "invert-colors"}`}
      />
      <p className={`${isActive ? "base-bold" : "base-medium"} max-lg:hidden`}>
        {label}
      </p>
    </Link>
  );
};

export default SidebarLink;
