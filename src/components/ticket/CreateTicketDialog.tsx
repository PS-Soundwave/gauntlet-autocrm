"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";

export default function CreateTicketDialog() {
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState("");
    const router = useRouter();

    const createTicket = trpc.customer.createTicket.useMutation({
        onSuccess: () => {
            setOpen(false);
            setContent("");
            router.refresh();
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await createTicket.mutate({ content });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Create New Ticket
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Support Ticket</DialogTitle>
                    <DialogDescription>
                        Describe your issue and we&apos;ll get back to you as
                        soon as possible.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="mt-4">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe your issue..."
                        className="min-h-[100px] resize-none"
                        required
                    />
                    <button
                        type="submit"
                        disabled={createTicket.isPending}
                        className="mt-4 w-full rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {createTicket.isPending
                            ? "Creating..."
                            : "Submit Ticket"}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
