import { TRPCError } from "@trpc/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import CreateTicketDialog from "@/components/CreateTicketDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@/components/shared/Table";
import { trpc } from "@/trpc/server";

export default async function CustomerTicketsPage() {
    const tickets = await trpc.customer.readAllTickets().catch((error) => {
        if (error instanceof TRPCError) {
            if (error.code === "UNAUTHORIZED") {
                redirect("/auth/sign-in");
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
            <Table>
                <TableHeader>
                    <tr>
                        <TableHeaderCell>Ticket</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                    </tr>
                </TableHeader>
                <TableBody columnCount={2}>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.ticketId}>
                            <TableCell>
                                <Link
                                    href={`/ticket/${ticket.ticketId}`}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    View Ticket
                                </Link>
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={ticket.status} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
