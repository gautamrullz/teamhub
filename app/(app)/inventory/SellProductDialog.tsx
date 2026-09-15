"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
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

type Batch = {
  id: string;
  batchCode: string;
  quantity: number;
  expiryDate: Date | null;
};

type SellProductDialogProps = {
  product: {
    id: string;
    name: string;
    sellingPrice: string;
    stock: number;
    batches: Batch[];
  };
};

export default function SellProductDialog({ product }: SellProductDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const selectedBatch = useMemo(
    () => product.batches.find((batch) => batch.id === batchId),
    [product.batches, batchId],
  );

  const requestedQuantity = Number(quantity) || 0;

  const availableInBatch = selectedBatch?.quantity ?? 0;

  const exceedsProductStock = requestedQuantity > product.stock;

  const exceedsBatchStock =
    Boolean(selectedBatch) && requestedQuantity > availableInBatch;

  const saleQuantity = Math.min(requestedQuantity, availableInBatch);

  const remainingQuantity = Math.max(requestedQuantity - saleQuantity, 0);

  const total = saleQuantity * Number(product.sellingPrice);

  function handleBatchChange(value: string) {
    setBatchId(value);
    setError("");
  }

  function handleQuantityChange(value: string) {
    setQuantity(value);
    setError("");
  }

  async function handleSubmit(formData: FormData) {
    if (exceedsProductStock) {
      const message = `Only ${product.stock} units are available.`;

      setError(message);
      toast.error(message);

      return;
    }

    if (!selectedBatch) {
      setError("Please select a batch.");

      return;
    }

    if (requestedQuantity <= 0) {
      setError("Quantity must be greater than 0.");

      return;
    }

    if (availableInBatch <= 0) {
      setError("The selected batch has no available stock.");

      return;
    }

    formData.set("quantity", String(saleQuantity));

    setIsPending(true);
    setError("");

    try {
      const result = await createStockMovement(formData);

      if (result.success) {
        setOpen(false);

        setBatchId("");
        setQuantity("1");

        if (remainingQuantity > 0) {
          toast.success(
            `${saleQuantity} ${product.name} sold successfully. ${remainingQuantity} remaining to sell from another batch.`,
          );
        } else {
          toast.success(`${saleQuantity} ${product.name} sold successfully.`);
        }

        router.refresh();

        return;
      }

      setError(result.message);
      toast.error(result.message);
    } catch (error) {
      console.error("Sell product failed:", error);

      const message = "Unable to complete sale. Please try again.";

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
      setBatchId("");
      setQuantity("1");
    }
  }

  const canSubmit =
    !isPending &&
    Boolean(selectedBatch) &&
    requestedQuantity > 0 &&
    !exceedsProductStock;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={product.stock === 0}>
          {product.stock === 0 ? "Out of stock" : "Sell"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sell {product.name}</DialogTitle>

          <DialogDescription>
            Available stock:{" "}
            <span className="font-medium text-foreground">{product.stock}</span>
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-5">
          <input type="hidden" name="type" value="SALE" />

          <input type="hidden" name="batchId" value={batchId} />

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor={`quantity-${product.id}`}>Quantity</Label>

            <Input
              id={`quantity-${product.id}`}
              name="quantity"
              type="number"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={(event) => handleQuantityChange(event.target.value)}
              disabled={isPending}
            />

            {exceedsProductStock && (
              <div
                role="alert"
                className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />

                <span>
                  Only {product.stock} units are available. You cannot sell more
                  than the current product stock.
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`batchId-${product.id}`}>Batch</Label>

            <select
              id={`batchId-${product.id}`}
              name="batchId"
              required
              value={batchId}
              onChange={(event) => handleBatchChange(event.target.value)}
              disabled={isPending}
              className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none"
            >
              <option value="" disabled>
                Select batch
              </option>

              {product.batches
                .filter((batch) => batch.quantity > 0)
                .map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.batchCode} — {batch.quantity} available
                  </option>
                ))}
            </select>
          </div>

          {exceedsBatchStock && selectedBatch && (
            <div
              role="alert"
              className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3"
            >
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />

                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    Only {selectedBatch.quantity} units are available in{" "}
                    {selectedBatch.batchCode}.
                  </p>

                  <p>
                    This sale will record {saleQuantity} units.{" "}
                    {remainingQuantity}{" "}
                    {remainingQuantity === 1 ? "unit" : "units"} will remain to
                    be sold from another batch.
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedBatch && (
            <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Requested quantity
                </span>

                <span className="font-medium">{requestedQuantity}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Available in batch
                </span>

                <span className="font-medium">{availableInBatch}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">This sale</span>

                <span className="font-medium">{saleQuantity}</span>
              </div>

              {remainingQuantity > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining</span>

                  <span className="font-medium">{remainingQuantity}</span>
                </div>
              )}
            </div>
          )}

          <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>

              <span className="text-lg font-semibold">₹{total.toFixed(2)}</span>
            </div>
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

            <Button type="submit" disabled={!canSubmit}>
              {isPending
                ? "Processing..."
                : exceedsBatchStock
                  ? `Sell ${saleQuantity}`
                  : "Complete sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
