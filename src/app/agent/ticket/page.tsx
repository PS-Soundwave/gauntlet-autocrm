import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
    TicketPriority,
    ticketPrioritySchema,
    TicketStatus,
    ticketStatusSchema
} from "@/api/types";
import TicketsPageClient from "@/components/ticket/TicketsPageClient";
import { trpc } from "@/trpc/server";

export default async function TicketsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const params = await searchParams;
    const view =
        (Array.isArray(params.view) ? params.view[0] : params.view) ?? "all";
    const tag = Array.isArray(params.tag) ? params.tag[0] : params.tag;
    const status = z
        .union([ticketStatusSchema, z.literal("not_closed")])
        .optional()
        .safeParse(params.status);
    const priority = z
        .union([ticketPrioritySchema, z.literal("untriaged")])
        .optional()
        .safeParse((await searchParams).priority);

    if (!status.success || !priority.success) {
        redirect("/agent/ticket");
    }

    const tickets = await getTickets(
        view,
        tag,
        status.data,
        priority.data
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
        <TicketsPageClient
            initialTickets={tickets}
            initialView={view}
            initialTag={tag}
            initialStatus={status.data}
            initialPriority={
                priority.data === "untriaged" ? null : priority.data
            }
        />
    );
}

const getTickets = (
    view: string,
    tag?: string,
    status?: TicketStatus | "not_closed",
    priority?: TicketPriority | "untriaged"
) => {
    if (view === "focus") {
        return trpc.agent.readFocusTickets({
            tag,
            status,
            priority: priority === "untriaged" ? null : priority
        });
    }

    return trpc.agent.readAllTickets({
        tag,
        status,
        priority: priority === "untriaged" ? null : priority
    });
};
