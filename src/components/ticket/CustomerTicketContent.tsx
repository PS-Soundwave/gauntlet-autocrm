"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { CustomerTicket, Message } from "@/api/types";
import { trpc } from "@/trpc/client";

const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
        open: "Open",
        in_progress: "In Progress",
        pending: "Pending",
        closed: "Closed"
    };
    return statusMap[status] ?? status;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "open":
        case "in_progress":
            return "bg-rose-500 text-white";
        case "pending":
            return "bg-blue-500 text-white";
        case "closed":
            return "bg-zinc-500 text-white";
        default:
            return "bg-zinc-500 text-white";
    }
};

export default function CustomerTicketContent({
    ticket: initialTicket
}: {
    ticket: CustomerTicket;
}) {
    const [messageInput, setMessageInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useParams();
    const ticketId = params.id as string;

    const { data: ticket } = trpc.customer.readTicket.useQuery(ticketId, {
        initialData: initialTicket,
        refetchOnMount: false
    });

    const createMessage = trpc.customer.createTicketMessage.useMutation();
    const utils = trpc.useUtils();

    const handleSubmit = (): void => {
        const trimmedMessage = messageInput.trim();
        if (!trimmedMessage) {
            return;
        }

        setIsSubmitting(true);

        createMessage
            .mutateAsync({
                ticketId,
                content: trimmedMessage
            })
            .then(() => {
                utils.customer.readTicket.invalidate(ticketId);
                setMessageInput("");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    return (
        <div className="flex h-screen flex-col">
            {/* Header Bar */}
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-2">
                <div
                    className={`rounded-md px-2 py-0.5 text-sm font-medium ${getStatusColor(ticket.status)}`}
                >
                    {formatStatus(ticket.status)}
                </div>
            </div>

            {/* Main Content */}
            <main className="flex min-h-0 flex-1 flex-col bg-white">
                <ScrollArea.Root className="min-h-0 flex-1 overflow-hidden">
                    <ScrollArea.Viewport className="h-full w-full p-4">
                        <div className="flex flex-col gap-3">
                            {ticket.messages.map(
                                (message: Message, index: number) => (
                                    <div
                                        key={index}
                                        className={`flex ${
                                            message.authorId !== ticket.authorId
                                                ? "justify-start"
                                                : "justify-end"
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                                                message.authorId !==
                                                ticket.authorId
                                                    ? "bg-gray-100 text-gray-900"
                                                    : "bg-blue-500 text-white"
                                            }`}
                                        >
                                            <div className="mb-1 text-xs font-medium opacity-75">
                                                {message.author}
                                            </div>
                                            <div className="whitespace-pre-wrap">
                                                {message.content}
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar
                        className="flex touch-none select-none bg-gray-100 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-200"
                        orientation="vertical"
                    >
                        <ScrollArea.Thumb className="relative flex-1 rounded-lg bg-gray-300 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                    </ScrollArea.Scrollbar>
                </ScrollArea.Root>

                <div className="border-t border-gray-200 bg-gray-50 p-4">
                    <div className="flex gap-3">
                        <textarea
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 resize-none rounded-md border border-gray-300 px-3 py-2 text-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            rows={3}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="self-end rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
