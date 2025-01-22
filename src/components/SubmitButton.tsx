import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { TicketStatus } from "@/api/types";

interface SubmitButtonProps {
    onSubmit: (_status?: TicketStatus) => void;
    isLoading?: boolean;
}

export default function SubmitButton({
    onSubmit,
    isLoading = false
}: SubmitButtonProps) {
    return (
        <div className="flex">
            <button
                onClick={() => onSubmit()}
                disabled={isLoading}
                className="flex-1 rounded-l-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
                {isLoading ? "Submitting..." : "Submit"}
            </button>
            <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                    <button
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-l-none rounded-r-md border-l border-gray-700 bg-black px-2 py-2.5 text-sm text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                    >
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
                        <DropdownMenu.Item
                            onClick={() => onSubmit("open")}
                            className="flex h-8 cursor-pointer items-center px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50"
                        >
                            Submit as Open
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            onClick={() => onSubmit("in_progress")}
                            className="flex h-8 cursor-pointer items-center px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50"
                        >
                            Submit as In Progress
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            onClick={() => onSubmit("pending")}
                            className="flex h-8 cursor-pointer items-center px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50"
                        >
                            Submit as Pending
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                            onClick={() => onSubmit("closed")}
                            className="flex h-8 cursor-pointer items-center px-2 text-sm outline-none hover:bg-gray-50 focus:bg-gray-50"
                        >
                            Submit as Closed
                        </DropdownMenu.Item>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
}
