import { getProducts } from "@/lib/services/products";

export default async function DashboardPage() {
  const products = await getProducts();

  return (
    <main className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2">You have {products.length} product(s).</p>
      </div>

      <div>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products found.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
