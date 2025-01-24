import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { ticketStatusSchema } from "@/api/types";

export default function StatusFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const status = z
        .union([ticketStatusSchema, z.literal("not_closed")])
        .optional()
        .safeParse(searchParams.get("status"));

    const handleStatusChange = (newStatus: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (newStatus) {
            params.set("status", newStatus);
        } else {
            params.delete("status");
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <select
            value={status.success ? status.data : ""}
            onChange={(e) => handleStatusChange(e.target.value || null)}
            className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
            <option value="">All Statuses</option>
            <option value="not_closed">Not Closed</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
        </select>
    );
}
