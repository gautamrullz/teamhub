"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createStockMovement } from "@/app/actions/inventory";
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

type Product = {
  id: string;
  name: string;
  sku: string;
};

type Batch = {
  id: string;
  batchCode: string;
  productId: string;
  quantity: number;
};

type CreateStockMovementDialogProps = {
  products: Product[];
  batches: Batch[];
};

type MovementType = "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT";

export default function CreateStockMovementDialog({
  products,
  batches,
}: CreateStockMovementDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const [productId, setProductId] = useState("");
  const [movementType, setMovementType] = useState<MovementType>("PURCHASE");

  const availableBatches = useMemo(
    () => batches.filter((batch) => batch.productId === productId),
    [batches, productId],
  );

  function handleProductChange(value: string) {
    setProductId(value);
  }

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");

    try {
      const result = await createStockMovement(formData);

      if (result.success) {
        setOpen(false);
        toast.success(result.message);
        router.refresh();

        setProductId("");
        setMovementType("PURCHASE");

        return;
      }

      setError(result.message);
      toast.error(result.message);
    } catch (error) {
      console.error("Create stock movement failed:", error);

      const message = "Unable to record stock movement. Please try again.";

      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setError("");
      setProductId("");
      setMovementType("PURCHASE");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>Stock movement</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record stock movement</DialogTitle>

          <DialogDescription>
            Record a purchase, sale, return, or stock adjustment.
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
              value={productId}
              onChange={(event) => handleProductChange(event.target.value)}
              disabled={isPending}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none"
            >
              <option value="">Select a product</option>

              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batchId">Batch</Label>

            <select
              id="batchId"
              name="batchId"
              required
              disabled={
                isPending || !productId || availableBatches.length === 0
              }
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none"
            >
              <option value="">
                {!productId
                  ? "Select a product first"
                  : availableBatches.length === 0
                    ? "No batches available"
                    : "Select a batch"}
              </option>

              {availableBatches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batchCode} — Stock: {batch.quantity}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Movement type</Label>

            <select
              id="type"
              name="type"
              required
              value={movementType}
              onChange={(event) =>
                setMovementType(event.target.value as MovementType)
              }
              disabled={isPending}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none"
            >
              <option value="PURCHASE">Purchase</option>

              <option value="SALE">Sale</option>

              <option value="RETURN">Return</option>

              <option value="ADJUSTMENT">Adjustment</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              {movementType === "ADJUSTMENT" ? "New quantity" : "Quantity"}
            </Label>

            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              step="1"
              required
              disabled={isPending}
              placeholder={
                movementType === "ADJUSTMENT"
                  ? "Enter new quantity"
                  : "Enter quantity"
              }
            />

            {movementType === "ADJUSTMENT" && (
              <p className="text-xs text-muted-foreground">
                Adjustment sets the batch stock to this exact quantity.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isPending || !productId || availableBatches.length === 0
              }
            >
              {isPending ? "Recording..." : "Record movement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
