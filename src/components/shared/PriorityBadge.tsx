import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
    priority: string | null;
    className?: string;
}

export const PriorityBadge = ({ priority, className }: PriorityBadgeProps) => {
    const getPriorityColor = (priority: string | null): string => {
        switch (priority) {
            case "urgent":
                return "bg-red-500 text-white";
            case "high":
                return "bg-orange-500 text-white";
            case "medium":
                return "bg-amber-500 text-white";
            case "low":
                return "bg-emerald-500 text-white";
            default:
                return "bg-gray-200 text-gray-700";
        }
    };

    const formatPriority = (priority: string | null): string => {
        if (!priority) {
            return "";
        }
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    };

    if (!priority) {
        return null;
    }

    return (
        <span
            className={cn(
                "inline-flex rounded px-2 py-0.5 text-xs font-medium",
                getPriorityColor(priority),
                className
            )}
        >
            {formatPriority(priority)}
        </span>
    );
};
