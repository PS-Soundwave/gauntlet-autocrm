"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Select from "@radix-ui/react-select";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import type { AgentTicket, Message, Skill, TicketStatus } from "@/api/types";
import { AddSkillButton, SkillPill } from "@/components/shared/SkillPill";
import StatusBadge from "@/components/shared/StatusBadge";
import Textarea from "@/components/shared/Textarea";
import SubmitButton from "@/components/SubmitButton";
import { trpc } from "@/trpc/client";

export default function TicketContent({
    ticket: initialTicket
}: {
    ticket: AgentTicket;
}) {
    const [messageInput, setMessageInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const messageInputRef = useRef<HTMLTextAreaElement>(null);
    const params = useParams();
    const ticketId = params.id as string;

    const { data: ticket } = trpc.agent.readTicket.useQuery(ticketId, {
        initialData: initialTicket,
        refetchOnMount: false
    });

    const [pendingPriority, setPendingPriority] = useState<
        typeof ticket.priority
    >(ticket.priority);
    const [pendingSkills, setPendingSkills] = useState<Skill[]>(ticket.skills);

    const createMessage = trpc.agent.createTicketMessage.useMutation();
    const updateTicket = trpc.agent.updateTicket.useMutation();
    const { data: allSkills } = trpc.agent.readAllSkills.useQuery();
    const utils = trpc.useUtils();

    const handleSubmit = (newStatus?: TicketStatus): void => {
        const status = newStatus ?? ticket.status;
        const trimmedMessage = messageInput.trim();

        setIsSubmitting(true);

        const promises: Promise<any>[] = [];

        if (trimmedMessage) {
            // Create message without status update
            promises.push(
                createMessage.mutateAsync({
                    ticketId,
                    content: trimmedMessage
                })
            );
        }

        // If status, priority, or skills have changed, update the ticket
        if (
            status !== ticket.status ||
            pendingPriority !== ticket.priority ||
            JSON.stringify(pendingSkills.map((s) => s.id).sort()) !==
                JSON.stringify(ticket.skills.map((s) => s.id).sort())
        ) {
            promises.push(
                updateTicket.mutateAsync({
                    ticketId,
                    status,
                    priority: pendingPriority,
                    skills: pendingSkills.map((s) => s.id)
                })
            );
        }

        // Execute all mutations
        Promise.all(promises)
            .then(() => {
                utils.agent.readTicket.invalidate(ticketId);
                setMessageInput("");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const handleAddSkill = (skill: Skill) => {
        setPendingSkills([...pendingSkills, skill]);
    };

    const handleRemoveSkill = (skillId: string) => {
        setPendingSkills(pendingSkills.filter((s) => s.id !== skillId));
    };

    return (
        <div className="flex h-screen flex-col">
            {/* Header Bar */}
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-2">
                <h1 className="text-base font-medium text-gray-900">
                    Ticket #{ticket.serial} - {ticket.title}
                </h1>
                <StatusBadge status={ticket.status} />
            </div>

            <div className="flex min-h-0 flex-1 divide-x divide-gray-200 bg-white">
                {/* Left Sidebar */}
                <ScrollArea.Root className="min-w-[200px] flex-1 bg-white">
                    <ScrollArea.Viewport className="h-full">
                        <div className="flex flex-col gap-4 p-4">
                            {/* Author Display */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Author
                                </label>
                                <div className="bg-gray-100 px-3 py-2 text-sm text-gray-900">
                                    {ticket.author}
                                </div>
                            </div>

                            {/* Priority Dropdown */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Priority
                                </label>
                                <Select.Root
                                    value={pendingPriority ?? "null"}
                                    onValueChange={(s) => {
                                        if (s === "null") {
                                            setPendingPriority(null);
                                        } else if (
                                            s === "low" ||
                                            s === "medium" ||
                                            s === "high" ||
                                            s === "urgent"
                                        ) {
                                            setPendingPriority(s);
                                        }
                                    }}
                                >
                                    <Select.Trigger className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100">
                                        <Select.Value placeholder="Select priority..." />
                                        <Select.Icon>
                                            <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                                        </Select.Icon>
                                    </Select.Trigger>

                                    <Select.Portal>
                                        <Select.Content className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                                            <Select.Viewport className="p-1">
                                                <Select.Item
                                                    value="null"
                                                    className="flex h-8 cursor-pointer items-center rounded px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50"
                                                >
                                                    <Select.ItemText>
                                                        -
                                                    </Select.ItemText>
                                                </Select.Item>
                                                <Select.Item
                                                    value="low"
                                                    className="flex h-8 cursor-pointer items-center rounded px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50"
                                                >
                                                    <Select.ItemText>
                                                        Low
                                                    </Select.ItemText>
                                                </Select.Item>
                                                <Select.Item
                                                    value="medium"
                                                    className="flex h-8 cursor-pointer items-center rounded px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50"
                                                >
                                                    <Select.ItemText>
                                                        Medium
                                                    </Select.ItemText>
                                                </Select.Item>
                                                <Select.Item
                                                    value="high"
                                                    className="flex h-8 cursor-pointer items-center rounded px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50"
                                                >
                                                    <Select.ItemText>
                                                        High
                                                    </Select.ItemText>
                                                </Select.Item>
                                                <Select.Item
                                                    value="urgent"
                                                    className="flex h-8 cursor-pointer items-center rounded px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50"
                                                >
                                                    <Select.ItemText>
                                                        Urgent
                                                    </Select.ItemText>
                                                </Select.Item>
                                            </Select.Viewport>
                                        </Select.Content>
                                    </Select.Portal>
                                </Select.Root>
                            </div>

                            {/* Skills Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Skills
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {pendingSkills.map((skill) => (
                                        <SkillPill
                                            key={skill.id}
                                            skill={skill}
                                            onRemove={() =>
                                                handleRemoveSkill(skill.id)
                                            }
                                        />
                                    ))}
                                </div>
                                {allSkills && (
                                    <div className="flex flex-wrap gap-2">
                                        {allSkills
                                            .filter(
                                                (skill) =>
                                                    !pendingSkills.some(
                                                        (s) => s.id === skill.id
                                                    )
                                            )
                                            .map((skill) => (
                                                <AddSkillButton
                                                    key={skill.id}
                                                    skill={skill}
                                                    onClick={() =>
                                                        handleAddSkill(skill)
                                                    }
                                                />
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar
                        className="flex touch-none select-none bg-gray-100 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-200"
                        orientation="vertical"
                    >
                        <ScrollArea.Thumb className="relative flex-1 rounded-lg bg-gray-300 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                    </ScrollArea.Scrollbar>
                </ScrollArea.Root>

                {/* Main Content */}
                <main className="flex min-h-0 flex-[3_3_0%] flex-col bg-white">
                    <ScrollArea.Root className="min-h-0 flex-1">
                        <ScrollArea.Viewport className="h-full p-4">
                            <div className="flex flex-col gap-3">
                                {ticket.messages.map(
                                    (message: Message, index: number) => (
                                        <div
                                            key={index}
                                            className={`flex ${
                                                message.authorId ===
                                                ticket.authorId
                                                    ? "justify-start"
                                                    : "justify-end"
                                            }`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                                                    message.authorId ===
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
                        <Textarea
                            ref={messageInputRef}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            className="min-h-[80px] leading-normal"
                            placeholder="Type your message..."
                        />
                    </div>
                </main>

                {/* Right Sidebar */}
                <ScrollArea.Root className="min-w-[200px] flex-1 bg-white">
                    <ScrollArea.Viewport className="h-full">
                        <div className="p-4">Right Sidebar Content</div>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar
                        className="flex touch-none select-none bg-gray-100 p-0.5 transition-colors duration-150 ease-out hover:bg-gray-200"
                        orientation="vertical"
                    >
                        <ScrollArea.Thumb className="relative flex-1 rounded-lg bg-gray-300 before:absolute before:left-1/2 before:top-1/2 before:h-full before:min-h-[44px] before:w-full before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']" />
                    </ScrollArea.Scrollbar>
                </ScrollArea.Root>
            </div>

            <div className="flex justify-end border-t border-gray-200 bg-white px-6 py-4">
                <SubmitButton
                    onSubmit={handleSubmit}
                    isLoading={isSubmitting}
                />
            </div>
        </div>
    );
}
