import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import * as Select from "@radix-ui/react-select";
import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { trpc } from "@/trpc/server";

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

export default async function TicketPage({
    params
}: {
    params: { id: string };
}) {
    const ticket = await trpc.readTicket((await params).id).catch((error) => {
        if (error instanceof TRPCError) {
            if (error.code === "UNAUTHORIZED") {
                redirect("/sign-in");
            }
            console.log(error.code);
            // TODO: For FORBIDDEN or NOT_FOUND, return null to show blank page
            return null;
        }

        throw error; // Re-throw unexpected errors
    });

    if (!ticket) {
        return null; // Return blank page for forbidden/not found
    }

    return (
        <div className="flex h-screen flex-col">
            {/* Header Bar */}
            <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-2">
                <h1 className="text-base font-medium text-gray-900">
                    Ticket #{ticket.serial}
                </h1>
                <div
                    className={`rounded-md px-2 py-0.5 text-sm font-medium ${getStatusColor(ticket.status)}`}
                >
                    {formatStatus(ticket.status)}
                </div>
            </div>

            <div className="flex flex-1 divide-x divide-gray-200 bg-white">
                {/* Left Sidebar */}
                <ScrollArea className="w-[20%] min-w-[200px] bg-white">
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
                                defaultValue={ticket.priority ?? "null"}
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
                    </div>
                </ScrollArea>

                {/* Main Content */}
                <main className="flex flex-1 flex-col bg-white">
                    <ScrollArea className="flex-1 p-4">
                        <div className="flex min-h-full flex-col gap-3">
                            {ticket.messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex ${
                                        message.authorId === ticket.authorId
                                            ? "justify-start"
                                            : "justify-end"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 text-sm ${
                                            message.authorId === ticket.authorId
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
                            ))}
                        </div>
                    </ScrollArea>

                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                        <textarea
                            className="font-inherit min-h-[80px] w-full resize-none rounded-md border border-gray-300 bg-white p-3 text-sm leading-normal placeholder:text-gray-500 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="Type your message..."
                        />
                    </div>
                </main>

                {/* Right Sidebar */}
                <ScrollArea className="w-[20%] min-w-[200px] bg-white">
                    <div className="p-4">Right Sidebar Content</div>
                </ScrollArea>
            </div>

            <div className="flex justify-end border-t border-gray-200 bg-white px-6 py-4">
                <div className="flex">
                    <button className="flex-1 rounded-l-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                        Submit
                    </button>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="inline-flex items-center justify-center rounded-l-none rounded-r-md border-l border-gray-700 bg-black px-2 py-2.5 text-sm text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                                <ChevronDownIcon className="h-4 w-4" />
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                side="top"
                                sideOffset={5}
                                className="z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg"
                            >
                                <DropdownMenu.Item className="flex h-8 cursor-pointer items-center px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50">
                                    Submit as Open
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex h-8 cursor-pointer items-center px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50">
                                    Submit as In Progress
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex h-8 cursor-pointer items-center px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50">
                                    Submit as Pending
                                </DropdownMenu.Item>
                                <DropdownMenu.Item className="flex h-8 cursor-pointer items-center px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50">
                                    Submit as Closed
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>
        </div>
    );
}
