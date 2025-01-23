"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { trpc } from "@/trpc/client";

export default function CreateSkillDialog() {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const utils = trpc.useUtils();

    const { mutate: createSkill } = trpc.admin.createSkill.useMutation({
        onSuccess: () => {
            setName("");
            setError(null);
            setIsLoading(false);
            utils.agent.readAllSkills.invalidate();
        },
        onError: (error) => {
            setIsLoading(false);
            if (error.data?.code === "CONFLICT") {
                setError("A skill with this name already exists");
            } else {
                setError("An unexpected error occurred");
            }
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        createSkill({ name });
    };

    return (
        <div className="space-y-2">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter skill name"
                    required
                    className="w-64"
                />
                <Button
                    type="submit"
                    isLoading={isLoading}
                    loadingText="Adding..."
                >
                    Add Skill
                </Button>
            </form>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
