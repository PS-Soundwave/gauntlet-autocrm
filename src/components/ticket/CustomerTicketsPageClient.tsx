"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { CustomerTicketMetadata, ticketStatusSchema } from "@/api/types";
import CreateTicketDialog from "@/components/CreateTicketDialog";
import StatusBadge from "@/components/shared/StatusBadge";
import StatusFilter from "@/components/shared/StatusFilter";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@/components/shared/Table";
import { trpc } from "@/trpc/client";

interface CustomerTicketsPageClientProps {
    initialTickets: CustomerTicketMetadata[];
}

export default function CustomerTicketsPageClient({
    initialTickets
}: CustomerTicketsPageClientProps) {
    const searchParams = useSearchParams();
    const status = z
        .union([ticketStatusSchema, z.literal("not_closed")])
        .optional()
        .safeParse(searchParams.get("status"));

    const { data: tickets } = trpc.customer.readAllTickets.useQuery(
        {
            status: status.success ? status.data : undefined
        },
        {
            initialData: initialTickets
        }
    );

    if (!tickets) {
        return null;
    }

    const gridTemplateColumns = "minmax(200px, 1fr) minmax(100px, auto)";

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Support Tickets</h1>
                <div className="flex items-center gap-4">
                    <StatusFilter />
                    <CreateTicketDialog />
                </div>
            </div>
            <Table gridTemplateColumns={gridTemplateColumns}>
                <TableHeader>
                    <TableHeaderCell>Ticket</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                </TableHeader>
                <TableBody columnCount={2}>
                    {tickets.map((ticket) => (
                        <TableRow key={ticket.ticketId}>
                            <TableCell>
                                <Link
                                    href={`/ticket/${ticket.ticketId}`}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    {ticket.title}
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
