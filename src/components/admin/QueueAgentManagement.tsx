import Checkbox from "@/components/shared/Checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/shared/Dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@/components/shared/Table";
import { trpc } from "@/trpc/client";

interface Agent {
    id: string;
    name: string;
}

interface QueueAgent {
    agentId: string;
    createdAt: string;
}

interface QueueAgentManagementProps {
    queueId: string;
    queueName: string;
    open: boolean;
    onOpenChange: (_open: boolean) => void;
}

export default function QueueAgentManagement({
    queueId,
    queueName,
    open,
    onOpenChange
}: QueueAgentManagementProps) {
    const utils = trpc.useUtils();
    const { data: agents } = trpc.admin.readAgents.useQuery();
    const { data: queueAgents } = trpc.admin.readQueueAgents.useQuery({
        queueId
    });

    const assignAgent = trpc.admin.assignAgentToQueue.useMutation({
        onSuccess: () => {
            utils.admin.readQueueAgents.invalidate({ queueId });
            // TODO: Patch fix for sync update of agent counts
            utils.admin.getQueues.invalidate();
        }
    });

    const removeAgent = trpc.admin.removeAgentFromQueue.useMutation({
        onSuccess: () => {
            utils.admin.readQueueAgents.invalidate({ queueId });
            // TODO: Patch fix for sync update of agent counts
            utils.admin.getQueues.invalidate();
        }
    });

    const handleToggleAgent = async (agentId: string, isAssigned: boolean) => {
        if (isAssigned) {
            await assignAgent.mutateAsync({ queueId, agentId });
        } else {
            await removeAgent.mutateAsync({ queueId, agentId });
        }
    };

    const gridTemplateColumns = "minmax(200px, 1fr) minmax(100px, auto)";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white sm:max-w-[625px]">
                <DialogHeader>
                    <DialogTitle>Manage Agents - {queueName}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[500px] overflow-y-auto">
                    <Table gridTemplateColumns={gridTemplateColumns}>
                        <TableHeader>
                            <TableHeaderCell>Agent Name</TableHeaderCell>
                            <TableHeaderCell center>Assigned</TableHeaderCell>
                        </TableHeader>
                        <TableBody columnCount={2}>
                            {agents?.map((agent: Agent) => {
                                const isAssigned = queueAgents?.some(
                                    (qa: QueueAgent) => qa.agentId === agent.id
                                );
                                return (
                                    <TableRow key={agent.id}>
                                        <TableCell>{agent.name}</TableCell>
                                        <TableCell center>
                                            <Checkbox
                                                checked={isAssigned}
                                                onCheckedChange={async (
                                                    checked
                                                ) => {
                                                    await handleToggleAgent(
                                                        agent.id,
                                                        checked ===
                                                            "indeterminate"
                                                            ? false
                                                            : checked
                                                    );
                                                }}
                                                className="h-5 w-5 rounded-md border-2 border-gray-400 hover:border-gray-600 data-[state=checked]:border-black data-[state=checked]:bg-black"
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
