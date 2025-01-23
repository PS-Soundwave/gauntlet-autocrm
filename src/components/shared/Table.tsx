import React, { Children, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
    children: ReactNode;
    className?: string;
    gridTemplateColumns?: string;
}

const Table = ({ children, className, gridTemplateColumns }: TableProps) => {
    return (
        <div className="overflow-x-auto">
            <div
                className={cn(
                    "grid min-w-full divide-y divide-gray-200",
                    className
                )}
                style={{ gridTemplateColumns }}
                role="table"
            >
                {children}
            </div>
        </div>
    );
};

interface TableHeaderProps {
    children: ReactNode;
    className?: string;
}

const TableHeader = ({ children, className }: TableHeaderProps) => {
    return (
        <div className={cn("contents", className)} role="rowgroup">
            <div className="contents" role="row">
                {children}
            </div>
        </div>
    );
};

interface TableHeaderCellProps {
    children: ReactNode;
    className?: string;
    center?: boolean;
}

const TableHeaderCell = ({
    children,
    className,
    center
}: TableHeaderCellProps) => {
    return (
        <div
            className={cn(
                "flex h-10 items-center bg-gray-50 px-6 text-left text-xs font-medium uppercase tracking-wider text-gray-500",
                center && "justify-center",
                className
            )}
            role="columnheader"
        >
            {children}
        </div>
    );
};

interface TableBodyProps {
    children: ReactNode;
    columnCount?: number;
}

const TableBody = ({ children, columnCount }: TableBodyProps) => {
    const hasItems = Children.count(children) > 0;

    return (
        <div className="contents" role="rowgroup">
            {hasItems ? (
                children
            ) : (
                <div className="contents" role="row">
                    {[...Array(columnCount || 1)].map((_, i) => (
                        <div key={i} className="bg-white" role="cell">
                            {""}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface TableRowProps {
    children: ReactNode;
    className?: string;
}

const TableRow = ({ children }: TableRowProps) => {
    return (
        <div className="contents" role="row">
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) {
                    return child;
                }
                return React.cloneElement(
                    child as React.ReactElement<{ className?: string }>,
                    {
                        className: cn(
                            (
                                child as React.ReactElement<{
                                    className?: string;
                                }>
                            ).props.className,
                            "bg-white hover:bg-gray-50"
                        )
                    }
                );
            })}
        </div>
    );
};

interface TableCellProps {
    children: ReactNode;
    className?: string;
    center?: boolean;
}

const TableCell = ({ children, className, center }: TableCellProps) => {
    return (
        <div
            className={cn(
                "flex h-10 items-center px-6",
                center && "justify-center",
                className
            )}
            role="cell"
        >
            {children}
        </div>
    );
};

export { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell };
