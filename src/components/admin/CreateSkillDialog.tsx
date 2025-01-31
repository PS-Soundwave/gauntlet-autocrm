"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/shared/Dialog";
import Input from "@/components/shared/Input";
import { trpc } from "@/trpc/client";
import Checkbox from "../shared/Checkbox";
import { Label } from "../shared/Label";
import Textarea from "../shared/Textarea";

export default function CreateSkillDialog() {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [smartAssign, setSmartAssign] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const utils = trpc.useUtils();

    const { mutate: createSkill } = trpc.admin.createSkill.useMutation({
        onSuccess: () => {
            setName("");
            setDescription("");
            setSmartAssign(false);
            setError(null);
            setIsLoading(false);
            setOpen(false);
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
        createSkill({
            name,
            description: description.trim() || undefined,
            smartAssign
        });
    };

    return (
        <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Skills</h2>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>Create Skill</Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                    <DialogHeader>
                        <DialogTitle>Create New Skill</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter skill name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter skill description"
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="smartAssign"
                                checked={smartAssign}
                                onCheckedChange={(checked) =>
                                    setSmartAssign(checked === true)
                                }
                            />
                            <Label htmlFor="smartAssign">
                                Enable smart assignment
                            </Label>
                        </div>
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            loadingText="Adding..."
                        >
                            Create Skill
                        </Button>
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
