"use client";

import { User } from "@/api/types";
import { RoleDropdown } from "@/components/shared/RoleDropdown";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@/components/shared/Table";
import { trpc } from "@/trpc/client";

interface UsersTableProps {
    initialUsers: User[];
}

export const UsersTable = ({ initialUsers }: UsersTableProps) => {
    const { data: users } = trpc.admin.readAllUsers.useQuery(undefined, {
        initialData: initialUsers
    });

    return (
        <Table>
            <TableHeader>
                <tr>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Role</TableHeaderCell>
                    <TableHeaderCell className="w-10">Actions</TableHeaderCell>
                </tr>
            </TableHeader>
            <TableBody columnCount={3}>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="capitalize">
                            {user.role}
                        </TableCell>
                        <TableCell>
                            <RoleDropdown
                                userId={user.id}
                                currentRole={user.role}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
