"use client";

import { useRef, useState } from "react";
import { PackagePlus } from "lucide-react";

import { createProduct, updateProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  name?: string;
  sku?: string;
  purchasePrice?: string;
  sellingPrice?: string;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

export default function ProductForm({
  mode,
  productId,
  name = "",
  sku = "",
  purchasePrice = "",
  sellingPrice = "",
  onSuccess,
  onError,
}: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError("");

    try {
      const result =
        mode === "create"
          ? await createProduct(formData)
          : await updateProduct(productId!, formData);

      if (result.success) {
        formRef.current?.reset();
        onSuccess(result.message);
        return;
      }

      setError(result.message);
      onError(result.message);
    } catch (error) {
      console.error(
        `${mode === "create" ? "Create" : "Update"} product failed:`,
        error,
      );

      const message =
        mode === "create"
          ? "Unable to add product. Please try again."
          : "Unable to update product. Please try again.";

      setError(message);
      onError(message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>

        <Input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          defaultValue={name}
          placeholder="Product name"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>

        <Input
          id="sku"
          name="sku"
          type="text"
          required
          defaultValue={sku}
          placeholder="Product SKU"
          disabled={isPending}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="purchasePrice">Purchase price</Label>

          <Input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={purchasePrice}
            placeholder="0.00"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling price</Label>

          <Input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={sellingPrice}
            placeholder="0.00"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={isPending}>
          Cancel
        </Button>

        <Button type="submit" disabled={isPending}>
          {mode === "create" && <PackagePlus />}
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
