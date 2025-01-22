import { Children, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
    children: ReactNode;
    className?: string;
}

const Table = ({ children, className }: TableProps) => {
    return (
        <div className="overflow-x-auto">
            <table
                className={cn("min-w-full divide-y divide-gray-200", className)}
            >
                {children}
            </table>
        </div>
    );
};

interface TableHeaderProps {
    children: ReactNode;
    className?: string;
}

const TableHeader = ({ children, className }: TableHeaderProps) => {
    return <thead className={cn("bg-gray-50", className)}>{children}</thead>;
};

interface TableHeaderCellProps {
    children: ReactNode;
    className?: string;
}

const TableHeaderCell = ({ children, className }: TableHeaderCellProps) => {
    return (
        <th
            className={cn(
                "px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500",
                className
            )}
        >
            {children}
        </th>
    );
};

interface TableBodyProps {
    children: ReactNode;
    className?: string;
    columnCount?: number;
}

const TableBody = ({ children, className, columnCount }: TableBodyProps) => {
    const hasItems = Children.count(children) > 0;

    return (
        <tbody
            className={cn(
                "bg-white",
                hasItems && "divide-y divide-gray-200",
                className
            )}
        >
            {hasItems ? (
                children
            ) : (
                <tr>
                    {[...Array(columnCount || 1)].map((_, i) => (
                        <td key={i}>{""}</td>
                    ))}
                </tr>
            )}
        </tbody>
    );
};

interface TableRowProps {
    children: ReactNode;
    className?: string;
}

const TableRow = ({ children, className }: TableRowProps) => {
    return <tr className={cn("hover:bg-gray-50", className)}>{children}</tr>;
};

interface TableCellProps {
    children: ReactNode;
    className?: string;
}

const TableCell = ({ children, className }: TableCellProps) => {
    return (
        <td className={cn("whitespace-nowrap px-6 py-4", className)}>
            {children}
        </td>
    );
};

export { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell };
