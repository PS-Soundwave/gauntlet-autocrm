import { Generated } from "kysely";

export interface Database {
    users: UserTable;
    tickets: TicketTable;
    ticket_messages: TicketMessagesTable;
    ticket_tags: TicketTagsTable;
    skills: SkillsTable;
    agent_skills: AgentSkillsTable;
    ticket_skills: TicketSkillsTable;
    queues: QueuesTable;
    queue_agents: QueueAgentsTable;
    queue_tickets: QueueTicketsTable;
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
    ticket: string;
    createdAt: Generated<Date>;
    name: string;
}

export interface SkillsTable {
    id: Generated<string>;
    name: string;
    createdAt: Generated<Date>;
}

export interface AgentSkillsTable {
    agent: string;
    skill: string;
    createdAt: Generated<Date>;
}

export interface TicketSkillsTable {
    ticket: string;
    skill: string;
    createdAt: Generated<Date>;
}

export interface QueuesTable {
    id: string;
    name: string;
    createdAt: Generated<Date>;
}

export interface QueueAgentsTable {
    queue: string;
    agent: string;
    created_at: Generated<Date>;
}

export interface QueueTicketsTable {
    queue: string;
    ticket: string;
    created_at: Generated<Date>;
}
