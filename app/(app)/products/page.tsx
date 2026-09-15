import CreateProductDialog from "./CreateProductDialog";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getProducts } from "@/lib/services/products";
import EditProductDialog from "./EditProductDialog";
import DeleteProductDialog from "./DeleteProductDialog";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="space-y-8 p-6 md:p-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Products
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage products for your organization.
          </p>
        </div>

        <CreateProductDialog />
      </div>

      {/* Product list */}
      <Card>
        <CardHeader>
          <CardTitle>Product catalog</CardTitle>

          <CardDescription>
            {products.length} {products.length === 1 ? "product" : "products"}{" "}
            in your organization.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {products.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed">
              <div className="space-y-1 text-center">
                <p className="text-sm font-medium">No products yet</p>

                <p className="text-sm text-muted-foreground">
                  Click &quot;Add product&quot; to create your first product.
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
                    <TableHead>Purchase price</TableHead>
                    <TableHead>Selling price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20 text-right">Action</TableHead>
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

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <EditProductDialog
                            product={{
                              id: product.id,
                              name: product.name,
                              sku: product.sku,
                              purchasePrice: product.purchasePrice.toString(),
                              sellingPrice: product.sellingPrice.toString(),
                            }}
                          />

                          <DeleteProductDialog
                            product={{
                              id: product.id,
                              name: product.name,
                            }}
                          />
                        </div>
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
