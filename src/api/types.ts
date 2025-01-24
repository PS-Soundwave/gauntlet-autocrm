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
    title: string;
};

export type AgentTicketCommon = TicketCommon & {
    priority: TicketPriority;
    serial: number;
    author: string;
    authorId: string;
};

export type AgentTicketMetadata = AgentTicketCommon & {
    ticketId: string;
    tags: TicketTag[];
};

export type TicketTag = {
    id: string;
    name: string;
};

export type Queue = {
    id: string;
    name: string;
};

export type AgentTicket = AgentTicketCommon & {
    messages: Message[];
    skills: Skill[];
    tags: TicketTag[];
    queue: Queue | null;
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
    type: "internal" | "public";
};

export const userRoleSchema = z.enum(["agent", "customer", "admin"]);

export type UserRole = z.infer<typeof userRoleSchema>;

export type User = {
    id: string;
    name: string;
    role: UserRole;
};

export type Skill = {
    id: string;
    name: string;
};

export type UpdateTicketInput = {
    ticketId: string;
    status: TicketStatus;
    priority: TicketPriority;
    skills: string[];
    tags: string[];
};
