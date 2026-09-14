import Link from "next/link";

import { createProduct } from "@/app/actions/products";
import { getProducts } from "@/lib/services/products";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>

        <p className="mt-2 text-muted-foreground">
          Manage products for your organization.
        </p>
      </div>

      <form action={createProduct} className="max-w-md space-y-4">
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
            className="w-full rounded-md border px-3 py-2"
            placeholder="Product name"
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
            className="w-full rounded-md border px-3 py-2"
            placeholder="Product SKU"
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
            className="w-full rounded-md border px-3 py-2"
            placeholder="0.00"
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
            className="w-full rounded-md border px-3 py-2"
            placeholder="0.00"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-white"
        >
          Create product
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Products</h2>

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products found.</p>
        ) : (
          <ul className="space-y-3">
            {products.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between rounded-md border p-4"
              >
                <div>
                  <p className="font-medium">{product.name}</p>

                  <p className="text-sm text-muted-foreground">
                    SKU: {product.sku}
                  </p>
                </div>

                <Link
                  href={`/products/${product.id}/edit`}
                  className="text-sm underline"
                >
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
