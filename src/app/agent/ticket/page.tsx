import { TRPCError } from "@trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";
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
            <Table>
                <TableHeader>
                    <tr>
                        <TableHeaderCell>Ticket #</TableHeaderCell>
                        <TableHeaderCell>Title</TableHeaderCell>
                        <TableHeaderCell>Customer</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Priority</TableHeaderCell>
                    </tr>
                </TableHeader>
                <TableBody columnCount={5}>
                    {tickets.map((ticket) => (
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
