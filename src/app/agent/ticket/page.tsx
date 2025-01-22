import { TRPCError } from "@trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { trpc } from "@/trpc/server";

export default async function TicketsPage() {
    const tickets = await trpc.agent.readAllTickets().catch((error) => {
        if (error instanceof TRPCError) {
            if (error.code === "UNAUTHORIZED") {
                redirect("/auth/sign-in");
            }

            if (error.code === "FORBIDDEN") {
                redirect("/");
            }
        }

        throw error; // Re-throw unexpected errors
    });

    if (!tickets) {
        return null; // Return blank page for forbidden
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-4 text-2xl font-bold">Support Tickets</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Ticket #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Priority
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {tickets.map((ticket) => (
                            <tr
                                key={ticket.serial}
                                className="hover:bg-gray-50"
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <Link
                                        href={`/agent/ticket/${ticket.ticketId}`}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        #{ticket.serial}
                                    </Link>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {ticket.author}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${getStatusColor(
                                            ticket.status
                                        )}`}
                                    >
                                        {formatStatus(ticket.status)}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {ticket.priority && (
                                        <span
                                            className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                                                ticket.priority
                                            )}`}
                                        >
                                            {formatPriority(ticket.priority)}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

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

const formatStatus = (status: string): string => {
    return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const formatPriority = (priority: string | null): string => {
    if (!priority) {
        return "";
    }
    return priority.charAt(0).toUpperCase() + priority.slice(1);
};
