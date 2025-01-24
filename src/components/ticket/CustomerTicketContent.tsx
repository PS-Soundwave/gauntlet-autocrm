"use client";

import * as ScrollArea from "@radix-ui/react-scroll-area";
import { useParams } from "next/navigation";
import { useState } from "react";
import type { CustomerTicket, Message } from "@/api/types";
import { Button } from "@/components/shared/Button";
import StatusBadge from "@/components/shared/StatusBadge";
import Textarea from "@/components/shared/Textarea";
import { trpc } from "@/trpc/client";

const CustomerTicketContent = ({
    ticket: initialTicket
}: {
    ticket: CustomerTicket;
}) => {
    const [messageInput, setMessageInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const params = useParams();
    const id = params.id as string;

    const { data: ticket } = trpc.customer.readTicket.useQuery(
        { id },
        {
            initialData: initialTicket,
            refetchOnMount: false
        }
    );

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
                id,
                content: trimmedMessage
            })
            .then(() => {
                utils.customer.readTicket.invalidate({ id });
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
                <h1 className="text-base font-medium text-gray-900">
                    {ticket.title}
                </h1>
                <StatusBadge status={ticket.status} />
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
                                                    ? "bg-gray-100"
                                                    : "bg-blue-500 text-white"
                                            }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar
                        className="flex touch-none select-none bg-gray-100 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-gray-200"
                        orientation="vertical"
                    >
                        <ScrollArea.Thumb className="relative flex-1 rounded-lg bg-gray-300 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                    </ScrollArea.Scrollbar>
                </ScrollArea.Root>

                {/* Message Input */}
                <div className="flex items-center gap-3 border-t border-gray-200 bg-white p-4">
                    <Textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        loadingText="Submitting..."
                    >
                        Submit
                    </Button>
                </div>
            </main>
        </div>
    );
};

export default CustomerTicketContent;
