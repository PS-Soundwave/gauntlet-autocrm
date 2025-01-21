import { TRPCError } from "@trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import CreateTicketDialog from "@/components/ticket/CreateTicketDialog";
import { trpc } from "@/trpc/server";

export default async function CustomerTicketsPage() {
    const tickets = await trpc.customer.readAllTickets().catch((error) => {
        if (error instanceof TRPCError) {
            if (error.code === "UNAUTHORIZED") {
                redirect("/sign-in");
            }
        }

        throw error; // Re-throw unexpected errors
    });

    if (!tickets) {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Support Tickets</h1>
                <CreateTicketDialog />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Ticket
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {tickets.map((ticket) => (
                            <tr
                                key={ticket.ticketId}
                                className="hover:bg-gray-50"
                            >
                                <td className="whitespace-nowrap px-6 py-4">
                                    <Link
                                        href={`/ticket/${ticket.ticketId}`}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        View Ticket
                                    </Link>
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

const formatStatus = (status: string): string => {
    return status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};
