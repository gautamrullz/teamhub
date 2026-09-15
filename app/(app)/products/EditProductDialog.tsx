"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import ProductForm from "./ProductForm";

type EditProductDialogProps = {
  product: {
    id: string;
    name: string;
    sku: string;
    purchasePrice: string;
    sellingPrice: string;
  };
};

export default function EditProductDialog({
  product,
}: EditProductDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = (message: string) => {
    setOpen(false);
    toast.success(message);
  };

  const handleError = (message: string) => {
    toast.error(message);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Edit ${product.name}`}
        >
          <Pencil />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit product</DialogTitle>

          <DialogDescription>
            Update the information for {product.name}.
          </DialogDescription>
        </DialogHeader>

        <ProductForm
          mode="edit"
          productId={product.id}
          name={product.name}
          sku={product.sku}
          purchasePrice={product.purchasePrice}
          sellingPrice={product.sellingPrice}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </DialogContent>
    </Dialog>
  );
}