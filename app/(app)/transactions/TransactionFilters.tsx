"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

type TransactionType = "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT";

type TransactionFiltersProps = {
  type?: TransactionType;
  from?: string;
  to?: string;
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

export default function TransactionFilters({
  type,
  from,
  to,
}: TransactionFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {transactionTypes.map((transactionType) => {
          const isActive = transactionType.value === type;

          const searchParams = new URLSearchParams();

          if (transactionType.value) {
            searchParams.set("type", transactionType.value);
          }

          if (from) {
            searchParams.set("from", from);
          }

          if (to) {
            searchParams.set("to", to);
          }

          const query = searchParams.toString();

          const href = query ? `/transactions?${query}` : "/transactions";

          return (
            <Button
              key={transactionType.label}
              asChild
              size="sm"
              variant={isActive ? "default" : "outline"}
            >
              <Link href={href}>{transactionType.label}</Link>
            </Button>
          );
        })}
      </div>

      <form
        method="GET"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        {type && <input type="hidden" name="type" value={type} />}

        <div className="space-y-2">
          <label htmlFor="from" className="text-sm font-medium">
            From
          </label>

          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs outline-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="to" className="text-sm font-medium">
            To
          </label>

          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs outline-none"
          />
        </div>

        <Button type="submit">Apply filters</Button>

        {(from || to) && (
          <Button asChild type="button" variant="ghost">
            <Link href={type ? `/transactions?type=${type}` : "/transactions"}>
              Clear dates
            </Link>
          </Button>
        )}
      </form>
    </div>
  );
}
