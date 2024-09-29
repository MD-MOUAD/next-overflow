"use client";
import React from "react";
import Server from "@/components/Server";

const Client = () => {
  console.log("I am client component");
  return (
    <>
      <div>This is an example client component</div>
      <Server />
    </>
  );
};

export default Client;
