"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import Link from "next/link";
import StatusBadge from "@/components/shared/StatusBadge";
import { trpc } from "@/trpc/client";

interface AuthorTicketsSidebarProps {
    authorId: string;
    currentTicketId: string;
}

export default function AuthorTicketsSidebar({
    authorId,
    currentTicketId
}: AuthorTicketsSidebarProps) {
    const { data: tickets } = trpc.agent.readTicketsByAuthor.useQuery(
        { authorId },
        { refetchOnMount: false }
    );

    if (!tickets) {
        return null;
    }

    const otherTickets = tickets.filter(
        (ticket) => ticket.ticketId !== currentTicketId
    );

    if (otherTickets.length === 0) {
        return (
            <div className="p-4 text-sm text-gray-500">
                No other tickets from this author
            </div>
        );
    }

    return (
        <ScrollArea.Root className="h-full">
            <ScrollArea.Viewport className="h-full">
                <div className="flex flex-col gap-3 p-4">
                    <h2 className="text-sm font-medium text-gray-900">
                        Other Tickets from Author
                    </h2>
                    <div className="flex flex-col gap-2">
                        {otherTickets.map((ticket) => (
                            <Link
                                key={ticket.ticketId}
                                href={`/agent/ticket/${ticket.ticketId}`}
                                className="group rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 hover:shadow-sm"
                            >
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div className="truncate text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                        #{ticket.serial} - {ticket.title}
                                    </div>
                                    <StatusBadge status={ticket.status} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </ScrollArea.Viewport>
            <ScrollArea.Scrollbar
                className="flex touch-none select-none bg-gray-100 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-200"
                orientation="vertical"
            >
                <ScrollArea.Thumb className="relative flex-1 rounded-lg bg-gray-300 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
            </ScrollArea.Scrollbar>
        </ScrollArea.Root>
    );
}
