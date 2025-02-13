import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("font-bold text-white text-xs sm:text-sm", className)}>{title}</div>;
  }

  const toggleSorting = () => {
    if (column.getIsSorted() === "desc") {
      column.toggleSorting(false);
    } else {
      column.toggleSorting(true);
    }
  };

  return (
    <div
      className={cn("flex items-center space-x-2 font-bold text-white text-xs sm:text-sm", className)}
      onClick={toggleSorting}
    >
      <span>{title}</span>
      {column.getIsSorted() === "desc" ? (
        <ArrowDown className="size-4" />
      ) : column.getIsSorted() === "asc" ? (
        <ArrowUp className="size-4" />
      ) : (
        <ChevronsUpDown className="size-4" />
      )}
    </div>
  );
}
