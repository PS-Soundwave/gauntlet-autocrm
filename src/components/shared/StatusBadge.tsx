import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
    const getStatusColor = (status: string): string => {
        switch (status) {
            case "open":
            case "in_progress":
                return "bg-rose-500 text-white";
            case "pending":
                return "bg-blue-500 text-white";
            case "closed":
                return "bg-zinc-500 text-white";
            default:
                return "bg-zinc-500 text-white";
        }
    };

    const formatStatus = (status: string): string => {
        const statusMap: Record<string, string> = {
            open: "Open",
            in_progress: "In Progress",
            pending: "Pending",
            closed: "Closed"
        };
        return statusMap[status] ?? status;
    };

    return (
        <span
            className={cn(
                "inline-flex rounded px-2 py-0.5 text-xs font-medium",
                getStatusColor(status),
                className
            )}
        >
            {formatStatus(status)}
        </span>
    );
};
