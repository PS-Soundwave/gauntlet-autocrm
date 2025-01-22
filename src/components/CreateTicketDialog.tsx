"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/shared/Button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/shared/Dialog";
import Input from "@/components/shared/Input";
import Textarea from "@/components/shared/Textarea";
import { trpc } from "@/trpc/client";

export default function CreateTicketDialog() {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const router = useRouter();

    const createTicket = trpc.customer.createTicket.useMutation({
        onSuccess: () => {
            setOpen(false);
            setTitle("");
            setContent("");
            router.refresh();
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await createTicket.mutate({ title, content });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create New Ticket</Button>
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
                    <Input
                        value={title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setTitle(e.target.value)
                        }
                        placeholder="Brief title for your issue..."
                        className="mb-4"
                        required
                    />
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Describe your issue..."
                        className="min-h-[100px] resize-none"
                        required
                    />
                    <Button
                        type="submit"
                        isLoading={createTicket.isPending}
                        loadingText="Creating..."
                        className="mt-4 w-full"
                    >
                        Submit Ticket
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
