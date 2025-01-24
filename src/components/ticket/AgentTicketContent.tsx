"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Select from "@radix-ui/react-select";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import type {
    AgentTicket,
    Message,
    Skill,
    TicketStatus,
    TicketTag
} from "@/api/types";
import { AddSkillButton, SkillPill } from "@/components/shared/SkillPill";
import StatusBadge from "@/components/shared/StatusBadge";
import { TagPill } from "@/components/shared/TagPill";
import Textarea from "@/components/shared/Textarea";
import SubmitButton from "@/components/SubmitButton";
import { trpc } from "@/trpc/client";
import AuthorTicketsSidebar from "./AuthorTicketsSidebar";

export default function TicketContent({
    ticket: initialTicket
}: {
    ticket: AgentTicket;
}) {
    const [messageInput, setMessageInput] = useState("");
    const [messageType, setMessageType] = useState<"public" | "internal">(
        "public"
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const messageInputRef = useRef<HTMLTextAreaElement>(null);
    const params = useParams();
    const id = params.id as string;

    const { data: ticket } = trpc.agent.readTicket.useQuery(
        { id },
        {
            initialData: initialTicket,
            refetchOnMount: false
        }
    );

    const [pendingPriority, setPendingPriority] = useState<
        typeof ticket.priority
    >(ticket.priority);
    const [pendingSkills, setPendingSkills] = useState<Skill[]>(ticket.skills);
    const [pendingTags, setPendingTags] = useState<TicketTag[]>(ticket.tags);

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
                    id,
                    content: trimmedMessage,
                    type: messageType
                })
            );
        }

        // If status, priority, skills, or tags have changed, update the ticket
        if (
            status !== ticket.status ||
            pendingPriority !== ticket.priority ||
            JSON.stringify(pendingSkills.map((s) => s.id).sort()) !==
                JSON.stringify(ticket.skills.map((s) => s.id).sort()) ||
            JSON.stringify(pendingTags.map((t) => t.name).sort()) !==
                JSON.stringify(ticket.tags.map((t) => t.name).sort())
        ) {
            promises.push(
                updateTicket.mutateAsync({
                    id,
                    status,
                    priority: pendingPriority,
                    skills: pendingSkills.map((s) => s.id),
                    tags: pendingTags.map((t) => t.name)
                })
            );
        }

        // Execute all mutations
        Promise.all(promises)
            .then(() => {
                utils.agent.readTicket.invalidate({ id });
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

    const handleAddTag = () => {
        const trimmedTag = tagInput.trim();
        if (trimmedTag && !pendingTags.some((t) => t.name === trimmedTag)) {
            setPendingTags([...pendingTags, { id: "", name: trimmedTag }]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagName: string) => {
        setPendingTags(pendingTags.filter((t) => t.name !== tagName));
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
                <ScrollArea.Root className="w-[300px] shrink-0 bg-white">
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

                            {/* Tags Section */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {pendingTags.map((tag) => (
                                        <TagPill
                                            key={tag.name}
                                            tag={tag.name}
                                            onRemove={() =>
                                                handleRemoveTag(tag.name)
                                            }
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) =>
                                            setTagInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddTag();
                                            }
                                        }}
                                        placeholder="Add a tag..."
                                        className="flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        Add
                                    </button>
                                </div>
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
                <main className="flex min-h-0 flex-[1_1_0%] flex-col bg-white">
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
                                                        : message.type ===
                                                            "internal"
                                                          ? "border border-amber-200 bg-amber-100 text-amber-900"
                                                          : "bg-blue-500 text-white"
                                                }`}
                                            >
                                                <div className="mb-1 flex items-center gap-2 text-xs font-medium opacity-75">
                                                    <span>
                                                        {message.author}
                                                    </span>
                                                    {message.type ===
                                                        "internal" && (
                                                        <span className="rounded bg-amber-200 px-1 py-0.5 text-[10px] font-medium text-amber-700">
                                                            Internal
                                                        </span>
                                                    )}
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
                        <div className="relative">
                            <Textarea
                                ref={messageInputRef}
                                value={messageInput}
                                onChange={(e) =>
                                    setMessageInput(e.target.value)
                                }
                                className="min-h-[80px] w-full pt-9 leading-normal"
                                placeholder="Type your message..."
                            />
                            <div className="absolute left-2 top-2">
                                <Select.Root
                                    value={messageType}
                                    onValueChange={(
                                        value: "public" | "internal"
                                    ) => setMessageType(value)}
                                >
                                    <Select.Trigger className="inline-flex h-6 items-center justify-between gap-1 rounded border border-gray-300 bg-white px-2 text-xs hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100">
                                        <Select.Value />
                                        <Select.Icon>
                                            <ChevronDownIcon className="h-3 w-3 text-gray-500" />
                                        </Select.Icon>
                                    </Select.Trigger>
                                    <Select.Portal>
                                        <Select.Content className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg">
                                            <Select.Viewport className="p-1">
                                                <Select.Item
                                                    value="public"
                                                    className="flex h-7 cursor-pointer items-center rounded px-2 text-xs outline-none hover:bg-gray-50 focus:bg-gray-50"
                                                >
                                                    <Select.ItemText>
                                                        Public
                                                    </Select.ItemText>
                                                </Select.Item>
                                                <Select.Item
                                                    value="internal"
                                                    className="flex h-7 cursor-pointer items-center rounded px-2 text-xs outline-none hover:bg-gray-50 focus:bg-gray-50"
                                                >
                                                    <Select.ItemText>
                                                        Internal
                                                    </Select.ItemText>
                                                </Select.Item>
                                            </Select.Viewport>
                                        </Select.Content>
                                    </Select.Portal>
                                </Select.Root>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Right Sidebar */}
                <ScrollArea.Root className="w-[300px] shrink-0 bg-white">
                    <ScrollArea.Viewport className="h-full">
                        <AuthorTicketsSidebar
                            authorId={ticket.authorId}
                            currentTicketId={id}
                        />
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
