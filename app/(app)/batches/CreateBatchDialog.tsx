"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createBatch } from "@/app/actions/batches";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Product = {
  id: string;
  name: string;
  sku: string;
};

type CreateBatchDialogProps = {
  products: Product[];
};

export default function CreateBatchDialog({
  products,
}: CreateBatchDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");

    try {
      const result = await createBatch(formData);

      if (result.success) {
        setOpen(false);
        toast.success(result.message);
        router.refresh();
        return;
      }

      setError(result.message);
      toast.error(result.message);
    } catch (error) {
      console.error("Create batch failed:", error);

      const message =
        "Unable to create batch. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add batch</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add batch</DialogTitle>

          <DialogDescription>
            Add a new inventory batch to a product.
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
            <Label htmlFor="productId">Product</Label>

            <select
              id="productId"
              name="productId"
              required
              disabled={isPending || products.length === 0}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none"
              defaultValue=""
            >
              <option value="" disabled>
                Select a product
              </option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>

            {products.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Create a product before adding a batch.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Initial quantity
            </Label>

            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              step="1"
              required
              disabled={isPending}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">
              Expiry date
            </Label>

            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isPending || products.length === 0
              }
            >
              {isPending ? "Creating..." : "Create batch"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}