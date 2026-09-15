import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { getInventoryTransactions } from "@/lib/services/transactions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TransactionFilters from "./TransactionFilters";

type TransactionType = "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT";

type TransactionsPageProps = {
  searchParams: Promise<{
    page?: string;
    type?: string;
    from?: string;
    to?: string;
  }>;
};

const transactionTypes: {
  label: string;
  value?: TransactionType;
}[] = [
  { label: "All" },
  { label: "Sales", value: "SALE" },
  { label: "Purchases", value: "PURCHASE" },
  { label: "Returns", value: "RETURN" },
  {
    label: "Adjustments",
    value: "ADJUSTMENT",
  },
];

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTypeVariant(type: string) {
  switch (type) {
    case "SALE":
      return "default" as const;

    case "PURCHASE":
      return "secondary" as const;

    case "RETURN":
      return "outline" as const;

    case "ADJUSTMENT":
      return "destructive" as const;

    default:
      return "outline" as const;
  }
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = await searchParams;

  const parsedPage = Number(params.page);

  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const type = transactionTypes.some((item) => item.value === params.type)
    ? (params.type as TransactionType)
    : undefined;

  const from =
    params.from && /^\d{4}-\d{2}-\d{2}$/.test(params.from)
      ? params.from
      : undefined;

  const to =
    params.to && /^\d{4}-\d{2}-\d{2}$/.test(params.to) ? params.to : undefined;

  const hasInvalidDateRange = from && to ? from > to : false;

  const result = hasInvalidDateRange
    ? {
        transactions: [],
        total: 0,
        page: 1,
        pageSize: 20,
        totalPages: 0,
      }
    : await getInventoryTransactions(page, 20, type, from, to);

  const start =
    result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;

  const end = Math.min(result.page * result.pageSize, result.total);

  function buildPageUrl(targetPage: number) {
    const searchParams = new URLSearchParams();

    if (targetPage > 1) {
      searchParams.set("page", String(targetPage));
    }

    if (type) {
      searchParams.set("type", type);
    }

    if (from) {
      searchParams.set("from", from);
    }

    if (to) {
      searchParams.set("to", to);
    }

    const query = searchParams.toString();

    return query ? `/transactions?${query}` : "/transactions";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Transaction History
        </h1>

        <p className="text-muted-foreground">
          View inventory activity and stock movements.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Transactions</CardTitle>

            <span className="text-sm text-muted-foreground">
              {result.total} total
            </span>
          </div>

          {/* Transaction type filter */}
          <TransactionFilters type={type} from={from} to={to} />
        </CardHeader>

        {hasInvalidDateRange && (
          <div className="mx-6 my-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            The &quot;From&quot; date cannot be later than the &quot;To&quot;
            date.
          </div>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>

                  <TableHead>Type</TableHead>

                  <TableHead>Product</TableHead>

                  <TableHead>SKU</TableHead>

                  <TableHead>Batch</TableHead>

                  <TableHead className="text-right">Quantity</TableHead>

                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {result.transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.transactionNumber}
                    </TableCell>

                    <TableCell>
                      <Badge variant={getTypeVariant(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </TableCell>

                    <TableCell>{transaction.productName}</TableCell>

                    <TableCell>{transaction.sku}</TableCell>

                    <TableCell>{transaction.batchCode ?? "—"}</TableCell>

                    <TableCell className="text-right font-medium">
                      {transaction.quantity}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatDate(transaction.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {result.transactions.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="font-medium">No transactions found</p>

              <p className="mt-1 text-sm text-muted-foreground">
                No transactions match the selected filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {result.total > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {start}–{end} of {result.total} transactions
          </p>

          {result.totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                size="sm"
                className={
                  result.page <= 1 ? "pointer-events-none opacity-50" : ""
                }
              >
                <Link href={buildPageUrl(result.page - 1)}>
                  <ArrowLeft />
                  Previous
                </Link>
              </Button>

              <span className="px-2 text-sm text-muted-foreground">
                Page {result.page} of {result.totalPages}
              </span>

              <Button
                asChild
                variant="outline"
                size="sm"
                className={
                  result.page >= result.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              >
                <Link href={buildPageUrl(result.page + 1)}>
                  Next
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
