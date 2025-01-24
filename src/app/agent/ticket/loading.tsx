import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@/components/shared/Table";

export default function Loading() {
    return (
        <div className="container mx-auto p-4">
            <div className="mb-4 flex items-center justify-between">
                <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                <div className="flex gap-4">
                    {/* Status Filter Skeleton */}
                    <div className="h-9 w-32 animate-pulse rounded-md border border-gray-200 bg-gray-100" />
                    {/* Priority Filter Skeleton */}
                    <div className="h-9 w-32 animate-pulse rounded-md border border-gray-200 bg-gray-100" />
                    {/* Tag Filter Skeleton */}
                    <div className="h-9 w-32 animate-pulse rounded-md border border-gray-200 bg-gray-100" />
                    {/* View Toggle Skeleton */}
                    <div className="h-9 w-[400px] animate-pulse rounded-md border border-gray-200 bg-gray-100" />
                </div>
            </div>
            <Table gridTemplateColumns="auto 1fr auto auto auto auto">
                <TableHeader>
                    <TableHeaderCell>Ticket #</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Tags</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Priority</TableHeaderCell>
                </TableHeader>
                <TableBody columnCount={6}>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell>
                                <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                            </TableCell>
                            <TableCell>
                                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
                            </TableCell>
                            <TableCell>
                                <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                                    <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                            </TableCell>
                            <TableCell>
                                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
