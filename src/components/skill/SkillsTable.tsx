"use client";

import { TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Button } from "@/components/shared/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@/components/shared/Table";
import { trpc } from "@/trpc/client";

interface Skill {
    id: string;
    name: string;
}

interface SkillsTableProps {
    initialSkills: Skill[];
}

export const SkillsTable = ({ initialSkills }: SkillsTableProps) => {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const utils = trpc.useUtils();
    const { data: skills } = trpc.agent.readAllSkills.useQuery(undefined, {
        initialData: initialSkills
    });

    const { mutate: deleteSkill } = trpc.admin.deleteSkill.useMutation({
        onSuccess: () => {
            setDeletingId(null);
            utils.agent.readAllSkills.invalidate();
        },
        onError: () => {
            setDeletingId(null);
        }
    });

    const handleDelete = (id: string) => {
        setDeletingId(id);
        deleteSkill(id);
    };

    const gridTemplateColumns = "minmax(200px, 1fr) minmax(100px, auto)";

    return (
        <Table gridTemplateColumns={gridTemplateColumns}>
            <TableHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell center>Actions</TableHeaderCell>
            </TableHeader>
            <TableBody columnCount={2}>
                {skills.map((skill) => (
                    <TableRow key={skill.id}>
                        <TableCell>{skill.name}</TableCell>
                        <TableCell center>
                            <Button
                                className="h-8 w-8 bg-transparent p-0 text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                                onClick={() => handleDelete(skill.id)}
                                title="Delete skill"
                                isLoading={deletingId === skill.id}
                                loadingText=""
                                disabled={deletingId !== null}
                            >
                                <TrashIcon className="h-4 w-4" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
