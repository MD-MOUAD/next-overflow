"use client";

import { deleteAnswer } from "@/lib/actions/answer.action";
import { deleteQuestion } from "@/lib/actions/question.actions";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";

interface Props {
  type: string;
  itemId: string;
}

const EditDeleteAction = ({ type, itemId }: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDisabled, setIsDisabled] = useState(false);

  const handleEdit = () => {
    router.push(`/question/edit/${JSON.parse(itemId)}`);
  };

  const handleDelete = async () => {
    try {
      setIsDisabled(true);
      if (type === "Question") {
        // Delete question
        await deleteQuestion({
          questionId: JSON.parse(itemId),
          path: pathname,
        });
      } else if (type === "Answer") {
        // Delete answer
        await deleteAnswer({
          answerId: JSON.parse(itemId),
          path: pathname,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsDisabled(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-3">
      {type === "Question" && (
        <Image
          src="/assets/icons/edit.svg"
          alt="Edit"
          width={14}
          height={14}
          className="shrink-0 cursor-pointer object-contain"
          onClick={handleEdit}
        />
      )}

      <div className="shrink-0">
        <Dialog>
          <DialogTrigger>
            <Image
              src="/assets/icons/trash.svg"
              alt="Delete"
              width={14}
              height={14}
              className="cursor-pointer object-contain hover:opacity-70"
            />
          </DialogTrigger>
          <DialogContent className="background-light800_dark400 border-none max-sm:max-w-[90%] max-sm:rounded-md">
            <DialogHeader>
              <DialogTitle className="text-dark100_light900 mb-2">
                Are you sure?
              </DialogTitle>
              <DialogDescription>
                <p className="text-dark300_light700">
                  This action cannot be undone. This will permanently delete
                  your question from our servers.
                </p>
                <div className="flex justify-end">
                  <Button
                    className="paragraph-medium max-h-8 bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400"
                    onClick={handleDelete}
                    disabled={isDisabled}
                  >
                    Delete
                  </Button>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EditDeleteAction;
