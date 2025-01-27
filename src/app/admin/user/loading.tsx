import { TableSkeleton } from "@/components/shared/Loading";

export default function Loading() {
    return (
        <>
            <h1 className="mb-4 text-2xl font-bold">Users Management</h1>
            <TableSkeleton rows={5} columns={3} />
        </>
    );
}
