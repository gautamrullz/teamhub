"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteBatch } from "@/app/actions/batches";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type DeleteBatchDialogProps = {
  batch: {
    id: string;
    batchCode: string;
    quantity: number;
  };
};

export default function DeleteBatchDialog({
  batch,
}: DeleteBatchDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleDelete() {
    setIsPending(true);

    try {
      const result = await deleteBatch(batch.id);

      if (result.success) {
        setOpen(false);
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    } catch (error) {
      console.error("Delete batch failed:", error);

      toast.error(
        "Unable to delete batch. Please try again.",
      );
    } finally {
      setIsPending(false);
    }
  }

  const hasStock = batch.quantity !== 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete ${batch.batchCode}`}
        >
          <Trash2 />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete batch?</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {batch.batchCode}
            </span>
            ?
            {hasStock
              ? " This batch still has stock and cannot be deleted."
              : " This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending || hasStock}
          >
            {isPending ? "Deleting..." : "Delete batch"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}