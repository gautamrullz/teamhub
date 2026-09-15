"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { updateBatch } from "@/app/actions/batches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type EditBatchDialogProps = {
  batch: {
    id: string;
    batchCode: string;
    expiryDate: Date | null;
  };
};

function formatDateForInput(date: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export default function EditBatchDialog({
  batch,
}: EditBatchDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");

    try {
      const result = await updateBatch(batch.id, formData);

      if (result.success) {
        setOpen(false);
        toast.success(result.message);
        router.refresh();
        return;
      }

      setError(result.message);
      toast.error(result.message);
    } catch (error) {
      console.error("Update batch failed:", error);

      const message =
        "Unable to update batch. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Edit ${batch.batchCode}`}
        >
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit batch</DialogTitle>

          <DialogDescription>
            Update the expiry date for{" "}
            <span className="font-medium text-foreground">
              {batch.batchCode}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`expiryDate-${batch.id}`}>
              Expiry date
            </Label>

            <Input
              id={`expiryDate-${batch.id}`}
              name="expiryDate"
              type="date"
              defaultValue={formatDateForInput(batch.expiryDate)}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}