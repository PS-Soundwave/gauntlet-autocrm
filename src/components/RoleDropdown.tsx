import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DotsVerticalIcon, UpdateIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { trpc } from "@/trpc/client";

interface RoleDropdownProps {
    userId: string;
    currentRole: string;
}

export const RoleDropdown = ({ userId, currentRole }: RoleDropdownProps) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const utils = trpc.useUtils();

    const { mutate: updateRole } = trpc.admin.updateUserRole.useMutation({
        onSuccess: () => {
            setIsUpdating(false);
            utils.admin.readAllUsers.invalidate();
        },
        onError: () => {
            setIsUpdating(false);
        }
    });

    const handleRoleChange = (role: string) => {
        if (role === "agent" || role === "customer" || role === "admin") {
            setIsUpdating(true);
            updateRole({ id: userId, role });
        }
    };

    if (isUpdating) {
        return (
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-gray-500">
                <UpdateIcon className="h-4 w-4 animate-spin" />
            </div>
        );
    }

    const roles = ["agent", "customer", "admin"] as const;
    const availableRoles = roles.filter((role) => role !== currentRole);

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent p-0 text-gray-500 hover:bg-gray-100">
                <DotsVerticalIcon className="h-4 w-4" />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    className="overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-lg"
                    sideOffset={5}
                >
                    {availableRoles.map((role) => (
                        <DropdownMenu.Item
                            key={role}
                            className="flex h-8 cursor-pointer items-center rounded px-2 text-sm capitalize outline-none hover:bg-gray-50 focus:bg-gray-50"
                            onSelect={() => handleRoleChange(role)}
                        >
                            Set as {role}
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};
