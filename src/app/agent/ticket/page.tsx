import { TRPCError } from "@trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { AgentTicketMetadata } from "@/api/types";
import PriorityBadge from "@/components/shared/PriorityBadge";
import StatusBadge from "@/components/shared/StatusBadge";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@/components/shared/Table";
import { trpc } from "@/trpc/server";

export default async function TicketsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
    const view = (await searchParams).view ?? "all";

    const tickets = await (
        view === "focus"
            ? trpc.agent.readFocusTickets()
            : trpc.agent.readAllTickets()
    ).catch((error: unknown) => {
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
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Support Tickets</h1>
                <div className="w-[400px]">
                    <div className="grid w-full grid-cols-2">
                        <Link
                            href="/agent/ticket?view=all"
                            className={`flex h-9 items-center justify-center whitespace-nowrap rounded-l border border-r-0 bg-white px-4 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                                view === "all"
                                    ? "border-gray-200 bg-gray-100 text-gray-900"
                                    : "border-gray-200 text-gray-500"
                            }`}
                        >
                            All
                        </Link>
                        <Link
                            href="/agent/ticket?view=focus"
                            className={`flex h-9 items-center justify-center whitespace-nowrap rounded-r border bg-white px-4 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                                view === "focus"
                                    ? "border-gray-200 bg-gray-100 text-gray-900"
                                    : "border-gray-200 text-gray-500"
                            }`}
                        >
                            Focus
                        </Link>
                    </div>
                </div>
            </div>
            <Table gridTemplateColumns="auto 1fr auto auto auto">
                <TableHeader>
                    <TableHeaderCell>Ticket #</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Priority</TableHeaderCell>
                </TableHeader>
                <TableBody columnCount={5}>
                    {tickets.map((ticket: AgentTicketMetadata) => (
                        <TableRow key={ticket.serial}>
                            <TableCell>
                                <Link
                                    href={`/agent/ticket/${ticket.ticketId}`}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    #{ticket.serial}
                                </Link>
                            </TableCell>
                            <TableCell>{ticket.title}</TableCell>
                            <TableCell>{ticket.author}</TableCell>
                            <TableCell>
                                <StatusBadge status={ticket.status} />
                            </TableCell>
                            <TableCell>
                                <PriorityBadge priority={ticket.priority} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
