import { Generated } from "kysely";

export interface Database {
    users: UserTable;
    tickets: TicketTable;
    ticket_messages: TicketMessagesTable;
    ticket_tags: TicketTagsTable;
}

export interface UserTable {
    id: string;
    createdAt: Generated<Date>;
    role: "agent" | "customer" | "admin";
    name: string;
}

export interface TicketTable {
    id: Generated<string>;
    serial: Generated<number>;
    createdAt: Generated<Date>;
    author: string;
    status: "open" | "in_progress" | "pending" | "closed";
    priority: "low" | "medium" | "high" | "urgent" | null;
    title: string;
}

export interface TicketMessagesTable {
    id: Generated<string>;
    serial: string;
    createdAt: Generated<Date>;
    ticket: string;
    author: string;
    type: "internal" | "public";
    content: string;
}

export interface TicketTagsTable {
    id: Generated<string>;
    createdAt: Generated<Date>;
    message: string;
    name: string;
}
