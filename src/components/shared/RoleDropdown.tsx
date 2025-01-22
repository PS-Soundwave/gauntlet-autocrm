import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { trpc } from "@/trpc/client";

interface RoleDropdownProps {
    userId: string;
    currentRole: string;
}

const RoleDropdown = ({ userId, currentRole }: RoleDropdownProps) => {
    const utils = trpc.useUtils();
    const updateRole = trpc.admin.updateUserRole.useMutation({
        onSuccess: () => {
            utils.admin.readAllUsers.invalidate();
        }
    });

    const roles = ["customer", "agent", "admin"] as const;
    const availableRoles = roles.filter((role) => role !== currentRole);

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="rounded p-1 hover:bg-gray-100">
                    <DotsVerticalIcon className="h-4 w-4" />
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="min-w-[160px] rounded-md bg-white p-1 shadow-lg"
                    sideOffset={5}
                >
                    {availableRoles.map((role) => (
                        <DropdownMenu.Item
                            key={role}
                            className="flex cursor-pointer items-center rounded px-2 py-1.5 text-sm outline-none hover:bg-gray-50"
                            onClick={() => {
                                updateRole.mutate({ id: userId, role });
                            }}
                        >
                            Set as {role}
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export { RoleDropdown };
