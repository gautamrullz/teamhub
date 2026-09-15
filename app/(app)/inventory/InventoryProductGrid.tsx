"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";

import SellProductDialog from "./SellProductDialog";

type Batch = {
  id: string;
  batchCode: string;
  quantity: number;
  expiryDate: Date | null;
};

type InventoryProduct = {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  sellingPrice: string;
  stock: number;
  batches: Batch[];
};

type InventoryProductGridProps = {
  products: InventoryProduct[];
};

export default function InventoryProductGrid({
  products,
}: InventoryProductGridProps) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) {
      return products;
    }

    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm),
    );
  }, [products, search]);

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search product name..."
          className="pl-9"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No products found</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Try a different product name.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <InventoryProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function InventoryProductCard({ product }: { product: InventoryProduct }) {
  const isOutOfStock = product.stock === 0;
  const stockLabel = isOutOfStock ? "Out of stock" : "In stock";

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-square bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div>
          <h2 className="font-medium leading-tight">{product.name}</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            SKU: {product.sku}
          </p>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Stock</p>

            <div className="flex items-center gap-2">
              <p
                className={`text-xl font-semibold ${
                  isOutOfStock ? "text-destructive" : ""
                }`}
              >
                {product.stock}
              </p>

              <span
                className={`text-xs font-medium ${
                  isOutOfStock ? "text-destructive" : "text-emerald-600"
                }`}
              >
                {stockLabel}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Price</p>

            <p className="font-medium">₹{product.sellingPrice}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <SellProductDialog product={product} />
        </div>
      </div>
    </div>
  );
}
