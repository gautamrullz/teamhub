"use client";

import { useState } from "react";
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

export default function CreateProductDialog() {
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
        <Button>
          Add product
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>

          <DialogDescription>
            Add a new product to your organization&apos;s catalog.
          </DialogDescription>
        </DialogHeader>

        <ProductForm
          mode="create"
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </DialogContent>
    </Dialog>
  );
}