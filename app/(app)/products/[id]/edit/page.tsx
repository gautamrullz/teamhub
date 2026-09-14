import Link from "next/link";
import { notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "@/app/actions/products";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
  });

  if (!product) {
    notFound();
  }

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <main className="space-y-8 p-8">
      <div>
        <Link href="/products" className="text-sm underline">
          ← Back to products
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Edit Product</h1>

        <p className="mt-2 text-muted-foreground">
          Update product information.
        </p>
      </div>

      <form
        action={updateProductWithId}
        className="max-w-md space-y-5"
      >
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            defaultValue={product.name}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sku" className="text-sm font-medium">
            SKU
          </label>

          <input
            id="sku"
            name="sku"
            type="text"
            required
            defaultValue={product.sku}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="purchasePrice" className="text-sm font-medium">
            Purchase Price
          </label>

          <input
            id="purchasePrice"
            name="purchasePrice"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={product.purchasePrice.toString()}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sellingPrice" className="text-sm font-medium">
            Selling Price
          </label>

          <input
            id="sellingPrice"
            name="sellingPrice"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={product.sellingPrice.toString()}
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          Save changes
        </button>
      </form>
    </main>
  );
}
