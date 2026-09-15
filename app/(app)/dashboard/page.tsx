import { CircleCheck, CircleX, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getProducts } from "@/lib/services/products";

export default async function DashboardPage() {
  const products = await getProducts();

  const activeProductCount = products.filter(
    (product) => product.status === "ACTIVE",
  ).length;

  const discontinuedProductCount = products.filter(
    (product) => product.status === "DISCONTINUED",
  ).length;

  return (
    <main className="space-y-8 p-6 md:p-8">
      {/* Page heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Dashboard
        </h1>

        <p className="text-sm text-muted-foreground">
          Overview of your TeamHub workspace.
        </p>
      </div>

      {/* Product overview */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>

            <Package className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold">{products.length}</div>

            <p className="mt-1 text-xs text-muted-foreground">
              Products in your catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Products
            </CardTitle>

            <CircleCheck className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold">{activeProductCount}</div>

            <p className="mt-1 text-xs text-muted-foreground">
              Currently available in your catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discontinued</CardTitle>

            <CircleX className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold">
              {discontinuedProductCount}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Products no longer active
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Product list */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>

        <CardContent>
          {products.length === 0 ? (
            <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed">
              <div className="text-center">
                <p className="text-sm font-medium">No products yet</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first product to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Selling Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {product.sku}
                      </TableCell>

                      <TableCell>₹{product.purchasePrice.toString()}</TableCell>

                      <TableCell>₹{product.sellingPrice.toString()}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            product.status === "ACTIVE"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {product.status === "ACTIVE"
                            ? "Active"
                            : "Discontinued"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
