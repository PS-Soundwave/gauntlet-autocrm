import { TableSkeleton } from "@/components/shared/Loading";

export default function Loading() {
    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Agents</h1>
            <TableSkeleton rows={5} columns={3} />
        </div>
    );
}
