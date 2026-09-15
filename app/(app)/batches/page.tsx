import { PackagePlus } from "lucide-react";

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

import { getBatches } from "@/lib/services/batches";

import CreateBatchDialog from "./CreateBatchDialog";
import { getProductsForBatch } from "@/lib/services/products";
import DeleteBatchDialog from "./DeleteBatchDialog";
import EditBatchDialog from "./EditBatchDialog";

function formatDate(date: Date | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function BatchesPage() {
  const [batches, products] = await Promise.all([
    getBatches(),
    getProductsForBatch(),
  ]);

  return (
    <main className="space-y-8 p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Batches
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage product batches and current inventory.
          </p>
        </div>

        <CreateBatchDialog products={products} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory batches</CardTitle>
        </CardHeader>

        <CardContent>
          {batches.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center rounded-lg border border-dashed">
              <PackagePlus className="mb-3 size-8 text-muted-foreground" />

              <p className="text-sm font-medium">No batches yet</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Create a batch to start tracking inventory.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">
                        {batch.batchCode}
                      </TableCell>

                      <TableCell>{batch.product.name}</TableCell>

                      <TableCell className="text-muted-foreground">
                        {batch.product.sku}
                      </TableCell>

                      <TableCell className="font-medium">
                        {batch.quantity}
                      </TableCell>

                      <TableCell>{formatDate(batch.expiryDate)}</TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            batch.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {batch.status === "ACTIVE"
                            ? "Active"
                            : batch.status === "DEPLETED"
                              ? "Depleted"
                              : "Expired"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <EditBatchDialog
                            batch={{
                              id: batch.id,
                              batchCode: batch.batchCode,
                              expiryDate: batch.expiryDate,
                            }}
                          />

                          <DeleteBatchDialog
                            batch={{
                              id: batch.id,
                              batchCode: batch.batchCode,
                              quantity: batch.quantity,
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
