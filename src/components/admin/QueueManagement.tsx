"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/shared/Dialog";
import Input from "@/components/shared/Input";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@/components/shared/Table";
import { trpc } from "@/trpc/client";
import { Label } from "../shared/Label";
import QueueAgentManagement from "./QueueAgentManagement";

interface Queue {
    id: string;
    name: string;
    agentCount: number;
}

export default function QueueManagement() {
    const [open, setOpen] = useState(false);
    const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
    const utils = trpc.useUtils();
    const { data: queues } = trpc.admin.getQueues.useQuery();
    const createQueue = trpc.admin.createQueue.useMutation({
        onSuccess: () => {
            setOpen(false);
            utils.admin.getQueues.invalidate();
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        await createQueue.mutateAsync({ name });
    };

    const gridTemplateColumns =
        "minmax(200px, 1fr) minmax(100px, auto) minmax(100px, auto)";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Queues</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>Create Queue</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                        <DialogHeader>
                            <DialogTitle>Create New Queue</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Queue Name</Label>
                                <Input id="name" name="name" required />
                            </div>
                            <Button type="submit">Create Queue</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Table gridTemplateColumns={gridTemplateColumns}>
                <TableHeader>
                    <TableHeaderCell>Queue Name</TableHeaderCell>
                    <TableHeaderCell>Assigned Agents</TableHeaderCell>
                    <TableHeaderCell center>Actions</TableHeaderCell>
                </TableHeader>
                <TableBody columnCount={3}>
                    {queues?.map((queue) => {
                        const queueWithTypes: Queue = {
                            id: queue.id,
                            name: queue.name,
                            agentCount: Number(queue.agentCount) || 0
                        };
                        return (
                            <TableRow key={queueWithTypes.id}>
                                <TableCell>{queueWithTypes.name}</TableCell>
                                <TableCell>
                                    {queueWithTypes.agentCount}
                                </TableCell>
                                <TableCell center>
                                    <Button
                                        className="h-8 bg-transparent px-3 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        onClick={() =>
                                            setSelectedQueue(queueWithTypes)
                                        }
                                    >
                                        Manage Agents
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            {selectedQueue && (
                <QueueAgentManagement
                    queueId={selectedQueue.id}
                    queueName={selectedQueue.name}
                    open={Boolean(selectedQueue)}
                    onOpenChange={(open) => !open && setSelectedQueue(null)}
                />
            )}
        </div>
    );
}
