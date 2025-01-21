export type Ticket = {
    status: "new" | "open" | "in_progress" | "pending" | "closed";
    author: string;
    authorId: string;
    priority: "low" | "medium" | "high" | "urgent" | null;
    serial: number;
    messages: Message[];
};

export type Message = {
    author: string;
    authorId: string;
    content: string;
};
