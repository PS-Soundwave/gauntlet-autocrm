import { z } from "zod";

export const ticketStatusSchema = z.enum([
    "open",
    "in_progress",
    "pending",
    "closed"
]);

export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketPrioritySchema = z
    .enum(["low", "medium", "high", "urgent"])
    .nullable();

export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

export type TicketCommon = {
    status: TicketStatus;
    author: string;
    authorId: string;
};

export type AgentTicketCommon = TicketCommon & {
    priority: TicketPriority;
    serial: number;
    author: string;
    authorId: string;
};

export type AgentTicketMetadata = AgentTicketCommon & {
    ticketId: string;
};

export type AgentTicket = AgentTicketCommon & {
    messages: Message[];
};

export type CustomerTicketMetadata = TicketCommon & {
    ticketId: string;
};

export type CustomerTicket = TicketCommon & {
    messages: Message[];
};

export type Message = {
    author: string;
    authorId: string;
    content: string;
};
