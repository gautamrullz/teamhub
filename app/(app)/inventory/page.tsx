import { getBatches } from "@/lib/services/batches";
import { getProducts } from "@/lib/services/products";

import InventoryProductGrid from "./InventoryProductGrid";

export default async function InventoryPage() {
  const [products, batches] = await Promise.all([getProducts(), getBatches()]);

  const stockByProduct = new Map<string, number>();

  for (const batch of batches) {
    const currentStock = stockByProduct.get(batch.productId) ?? 0;

    stockByProduct.set(batch.productId, currentStock + batch.quantity);
  }

  const inventoryProducts = products
    .filter((product) => product.status === "ACTIVE")
    .map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      imageUrl: product.imageUrl,
      sellingPrice: product.sellingPrice.toString(),
      stock: stockByProduct.get(product.id) ?? 0,
      batches: batches
        .filter((batch) => batch.productId === product.id && batch.quantity > 0)
        .map((batch) => ({
          id: batch.id,
          batchCode: batch.batchCode,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
        })),
    }));

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>

        <p className="text-sm text-muted-foreground">
          Sell products and manage current stock.
        </p>
      </div>

      <InventoryProductGrid products={inventoryProducts} />
    </div>
  );
}
