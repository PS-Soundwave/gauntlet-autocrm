"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import {
    ticketPrioritySchema,
    ticketStatusSchema,
    type AgentTicketMetadata,
    type TicketPriority,
    type TicketTag
} from "@/api/types";
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
import { TagPill } from "@/components/shared/TagPill";
import { trpc } from "@/trpc/client";

type TicketStatus =
    | "open"
    | "in_progress"
    | "pending"
    | "closed"
    | "not_closed";

const isValidStatus = (
    status: string | null | undefined
): status is TicketStatus | null => {
    if (!status) {
        return true;
    }
    return ["open", "in_progress", "pending", "closed", "not_closed"].includes(
        status
    );
};

const isValidPriority = (
    priority: string | null
): priority is TicketPriority | "untriaged" | "" => {
    if (!priority) {
        return true;
    }

    return ["", "untriaged", "low", "medium", "high", "urgent"].includes(
        priority
    );
};

interface TicketsPageClientProps {
    initialTickets: AgentTicketMetadata[];
    initialView: string;
    initialTag: string | undefined;
    initialStatus: TicketStatus | undefined;
    initialPriority: TicketPriority | undefined;
}

export default function TicketsPageClient({
    initialTickets
}: TicketsPageClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get("view") ?? "all";
    const tag = searchParams.get("tag");
    const status = z
        .union([ticketStatusSchema, z.literal("not_closed")])
        .safeParse(searchParams.get("status"));
    const priority = z
        .union([ticketPrioritySchema, z.literal("untriaged")])
        .nullable()
        .safeParse(searchParams.get("priority"));

    const { data: tickets } = trpc.agent.readAllTickets.useQuery(
        {
            tag: tag ?? undefined,
            status: status.success ? status.data : undefined,
            priority:
                priority.data === null
                    ? undefined
                    : priority.data === "untriaged"
                      ? null
                      : priority.data
        },
        {
            initialData: view === "all" ? initialTickets : undefined,
            enabled: view === "all"
        }
    );

    const { data: focusTickets } = trpc.agent.readFocusTickets.useQuery(
        {
            tag: tag ?? undefined,
            status: status.success ? status.data : undefined,
            priority: priority.data === "untriaged" ? null : priority.data
        },
        {
            initialData: view === "focus" ? initialTickets : undefined,
            enabled: view === "focus"
        }
    );

    const { data: queueTickets } = trpc.agent.readQueueTickets.useQuery(
        {
            tag: tag ?? undefined,
            status: status.success ? status.data : undefined,
            priority: priority.data === "untriaged" ? null : priority.data
        },
        {
            initialData: view === "queues" ? initialTickets : undefined,
            enabled: view === "queues"
        }
    );

    const currentTickets =
        view === "focus"
            ? focusTickets
            : view === "queues"
              ? queueTickets
              : tickets;

    // Get all available tags from the server
    const { data: allTags = [] } = trpc.agent.readAllTicketTags.useQuery();

    const handleTagChange = (newTag: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (newTag) {
            params.set("tag", newTag);
        } else {
            params.delete("tag");
        }
        router.push(`/agent/ticket?${params.toString()}`);
    };

    const handleStatusChange = (newStatus: string | null) => {
        if (newStatus && !isValidStatus(newStatus)) {
            return;
        }

        const params = new URLSearchParams(searchParams);
        if (newStatus) {
            params.set("status", newStatus);
        } else {
            params.delete("status");
        }
        router.push(`/agent/ticket?${params.toString()}`);
    };

    const handlePriorityChange = (newPriority: string | null) => {
        if (!isValidPriority(newPriority)) {
            return;
        }

        if (newPriority === null) {
            return;
        }

        console.log(newPriority);
        const params = new URLSearchParams(searchParams);
        if (newPriority !== "") {
            params.set("priority", newPriority);
        } else {
            params.delete("priority");
        }
        router.push(`/agent/ticket?${params.toString()}`);
    };

    const handleViewChange = (newView: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("view", newView);
        router.push(`/agent/ticket?${params.toString()}`);
    };

    if (!currentTickets) {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Support Tickets</h1>
                <div className="flex gap-4">
                    <select
                        value={status.success ? status.data : ""}
                        onChange={(e) =>
                            handleStatusChange(e.target.value || null)
                        }
                        className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="not_closed">Not Closed</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="pending">Pending</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select
                        value={priority.data === null ? "" : priority.data}
                        onChange={(e) => handlePriorityChange(e.target.value)}
                        className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Priorities</option>
                        <option value="untriaged">Untriaged</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                    <select
                        value={tag ?? ""}
                        onChange={(e) =>
                            handleTagChange(e.target.value || null)
                        }
                        className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">All Tags</option>
                        {allTags.map((t: string) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                    </select>
                    <div className="w-[400px]">
                        <div className="grid w-full grid-cols-3">
                            <button
                                onClick={() => handleViewChange("all")}
                                className={`flex h-9 items-center justify-center whitespace-nowrap rounded-l border border-r-0 bg-white px-4 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                                    view === "all"
                                        ? "border-gray-200 bg-gray-100 text-gray-900"
                                        : "border-gray-200 text-gray-500"
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleViewChange("focus")}
                                className={`flex h-9 items-center justify-center whitespace-nowrap border border-r-0 bg-white px-4 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                                    view === "focus"
                                        ? "border-gray-200 bg-gray-100 text-gray-900"
                                        : "border-gray-200 text-gray-500"
                                }`}
                            >
                                Focus
                            </button>
                            <button
                                onClick={() => handleViewChange("queues")}
                                className={`flex h-9 items-center justify-center whitespace-nowrap rounded-r border bg-white px-4 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                                    view === "queues"
                                        ? "border-gray-200 bg-gray-100 text-gray-900"
                                        : "border-gray-200 text-gray-500"
                                }`}
                            >
                                My Queues
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Table gridTemplateColumns="auto 1fr auto auto auto auto">
                <TableHeader>
                    <TableHeaderCell>Ticket #</TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Tags</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Priority</TableHeaderCell>
                </TableHeader>
                <TableBody columnCount={6}>
                    {currentTickets.map((ticket: AgentTicketMetadata) => (
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
                                <div className="flex flex-wrap gap-1">
                                    {ticket.tags.map((t: TicketTag) => (
                                        <TagPill key={t.name} tag={t.name} />
                                    ))}
                                </div>
                            </TableCell>
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
