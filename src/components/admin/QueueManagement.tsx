"use client";

import { TrashIcon } from "@radix-ui/react-icons";
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
import Checkbox from "../shared/Checkbox";
import { Label } from "../shared/Label";
import Textarea from "../shared/Textarea";
import QueueAgentManagement from "./QueueAgentManagement";

interface Queue {
    id: string;
    name: string;
    description?: string;
    smartAssign: boolean;
    agentCount: number;
}

export default function QueueManagement() {
    const [open, setOpen] = useState(false);
    const [selectedQueue, setSelectedQueue] = useState<Queue | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const utils = trpc.useUtils();
    const { data: queues } = trpc.admin.getQueues.useQuery();
    const createQueue = trpc.admin.createQueue.useMutation({
        onSuccess: () => {
            setOpen(false);
            utils.admin.getQueues.invalidate();
        }
    });

    const { mutate: deleteQueue } = trpc.admin.deleteQueue.useMutation({
        onSuccess: () => {
            setDeletingId(null);
            utils.admin.getQueues.invalidate();
        },
        onError: (error) => {
            console.error("Error deleting queue", error);
            setDeletingId(null);
        }
    });

    const handleDelete = (id: string) => {
        setDeletingId(id);
        deleteQueue({ id });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const description = (formData.get("description") as string).trim();
        const smartAssign = formData.get("smartAssign") === "on";
        await createQueue.mutateAsync({
            name,
            description: description || undefined,
            smartAssign
        });
    };

    const gridTemplateColumns =
        "minmax(200px, 1fr) minmax(200px, 1fr) minmax(100px, auto) minmax(100px, auto) minmax(100px, auto) minmax(100px, auto)";

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
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter queue description"
                                    className="min-h-[100px] resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Checkbox id="smartAssign" name="smartAssign" />
                                <Label htmlFor="smartAssign">
                                    Enable smart assignment
                                </Label>
                            </div>
                            <Button type="submit">Create Queue</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Table gridTemplateColumns={gridTemplateColumns}>
                <TableHeader>
                    <TableHeaderCell>Queue Name</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                    <TableHeaderCell>Assigned Agents</TableHeaderCell>
                    <TableHeaderCell center>Smart Assign</TableHeaderCell>
                    <TableHeaderCell center>Manage</TableHeaderCell>
                    <TableHeaderCell center>Delete</TableHeaderCell>
                </TableHeader>
                <TableBody columnCount={6}>
                    {queues?.map((queue) => {
                        const queueWithTypes: Queue = {
                            id: queue.id,
                            name: queue.name,
                            description: queue.description || undefined,
                            smartAssign: queue.smartAssign,
                            agentCount: Number(queue.agentCount) || 0
                        };
                        return (
                            <TableRow key={queueWithTypes.id}>
                                <TableCell>{queueWithTypes.name}</TableCell>
                                <TableCell>
                                    <div className="truncate">
                                        {queueWithTypes.description}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {queueWithTypes.agentCount}
                                </TableCell>
                                <TableCell center>
                                    {queueWithTypes.smartAssign ? "On" : "Off"}
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
                                <TableCell center>
                                    <Button
                                        className="h-8 w-8 bg-transparent p-0 text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                                        onClick={() =>
                                            handleDelete(queueWithTypes.id)
                                        }
                                        title="Delete queue"
                                        isLoading={
                                            deletingId === queueWithTypes.id
                                        }
                                        loadingText=""
                                        disabled={deletingId !== null}
                                    >
                                        <TrashIcon className="h-4 w-4" />
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
