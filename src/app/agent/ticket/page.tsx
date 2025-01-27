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
    const view = z
        .union([z.literal("focus"), z.literal("queues")])
        .optional()
        .safeParse(params.view);
    const tag = z.string().optional().safeParse(params.tag);
    const status = z
        .union([ticketStatusSchema, z.literal("not_closed")])
        .optional()
        .safeParse(params.status);
    const priority = z
        .union([ticketPrioritySchema, z.literal("untriaged")])
        .optional()
        .safeParse((await searchParams).priority);

    if (!view.success || !tag.success || !status.success || !priority.success) {
        redirect("/agent/ticket");
    }

    const tickets = await getTickets(
        view.data,
        tag.data,
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
        return null;
    }

    return <TicketsPageClient initialTickets={tickets} />;
}

const getTickets = (
    view?: "focus" | "queues",
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

    if (view === "queues") {
        return trpc.agent.readQueueTickets({
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
