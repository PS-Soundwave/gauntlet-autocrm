"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Skill, UserRole } from "@/api/types";
import { AddSkillButton, SkillPill } from "@/components/shared/SkillPill";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow
} from "@/components/shared/Table";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";

interface Agent {
    id: string;
    name: string;
    role: UserRole;
    skills: Skill[];
}

interface AgentsTableProps {
    initialAgents: Agent[];
}

const formatRole = (role: UserRole) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
};

export const AgentsTable = ({ initialAgents }: AgentsTableProps) => {
    const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);
    const utils = trpc.useUtils();
    const { data: agents } = trpc.admin.readAgents.useQuery(undefined, {
        initialData: initialAgents
    });
    const { data: allSkills } = trpc.agent.readAllSkills.useQuery();
    const { mutate: addSkill } = trpc.admin.addAgentSkill.useMutation({
        onSuccess: () => {
            utils.admin.readAgents.invalidate();
        }
    });
    const { mutate: removeSkill } = trpc.admin.removeAgentSkill.useMutation({
        onSuccess: () => {
            utils.admin.readAgents.invalidate();
        }
    });

    if (!agents || !allSkills) {
        return null;
    }

    const gridTemplateColumns =
        "minmax(200px, 1fr) minmax(100px, auto) minmax(400px, 2fr)";

    return (
        <Table gridTemplateColumns={gridTemplateColumns}>
            <TableHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell center>Role</TableHeaderCell>
                <TableHeaderCell>Skills</TableHeaderCell>
            </TableHeader>
            <TableBody>
                {agents.map((agent: Agent) => (
                    <TableRow key={agent.id}>
                        <TableCell className="h-auto py-4 font-medium">
                            {agent.name}
                        </TableCell>
                        <TableCell center className="h-auto py-4">
                            {formatRole(agent.role)}
                        </TableCell>
                        <TableCell className="h-auto overflow-hidden py-4">
                            <div className="flex w-full flex-col">
                                <div className="flex items-center justify-between">
                                    <div className="flex-col">
                                        <div className="flex flex-wrap gap-2">
                                            {agent.skills.map(
                                                (skill: Skill) => (
                                                    <SkillPill
                                                        key={skill.id}
                                                        skill={skill}
                                                        onRemove={
                                                            expandedAgentId ===
                                                            agent.id
                                                                ? () =>
                                                                      removeSkill(
                                                                          {
                                                                              userId: agent.id,
                                                                              skillId:
                                                                                  skill.id
                                                                          }
                                                                      )
                                                                : undefined
                                                        }
                                                    />
                                                )
                                            )}
                                            {agent.skills.length === 0 && (
                                                <span className="text-sm text-gray-500">
                                                    No skills assigned
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setExpandedAgentId(
                                                expandedAgentId === agent.id
                                                    ? null
                                                    : agent.id
                                            )
                                        }
                                        className="ml-4 flex h-6 w-6 flex-none items-center justify-center rounded-full hover:bg-gray-100"
                                    >
                                        <ChevronDownIcon
                                            className={cn(
                                                "h-4 w-4 transform transition-transform duration-200",
                                                expandedAgentId === agent.id
                                                    ? "rotate-180"
                                                    : ""
                                            )}
                                        />
                                    </button>
                                </div>

                                {/* Add Skills */}
                                <div
                                    className={cn(
                                        "grid pt-3 transition-[grid-template-rows,opacity] duration-200",
                                        expandedAgentId === agent.id
                                            ? "grid-rows-[1fr] opacity-100"
                                            : "grid-rows-[0fr] opacity-0"
                                    )}
                                >
                                    <div className="overflow-hidden">
                                        {allSkills.some(
                                            (skill) =>
                                                !agent.skills.some(
                                                    (s) => s.id === skill.id
                                                )
                                        ) && (
                                            <div>
                                                <div className="mb-2 text-xs font-medium text-gray-500">
                                                    Add skills:
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {allSkills
                                                        .filter(
                                                            (skill: Skill) =>
                                                                !agent.skills.some(
                                                                    (
                                                                        s: Skill
                                                                    ) =>
                                                                        s.id ===
                                                                        skill.id
                                                                )
                                                        )
                                                        .map((skill: Skill) => (
                                                            <AddSkillButton
                                                                key={skill.id}
                                                                skill={skill}
                                                                onClick={() =>
                                                                    addSkill({
                                                                        userId: agent.id,
                                                                        skillId:
                                                                            skill.id
                                                                    })
                                                                }
                                                            />
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
