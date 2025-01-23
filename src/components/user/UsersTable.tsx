"use client";

import { User } from "@/api/types";
import { RoleDropdown } from "@/components/RoleDropdown";
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

    const gridTemplateColumns =
        "minmax(200px, 1fr) minmax(150px, auto) minmax(100px, auto)";

    return (
        <Table gridTemplateColumns={gridTemplateColumns}>
            <TableHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell center>Actions</TableHeaderCell>
            </TableHeader>
            <TableBody columnCount={3}>
                {users.map((user) => (
                    <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="capitalize">
                            {user.role}
                        </TableCell>
                        <TableCell center>
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
