import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import CreateSkillDialog from "@/components/skill/CreateSkillDialog";
import { SkillsTable } from "@/components/skill/SkillsTable";
import { trpc } from "@/trpc/server";

export default async function SkillsPage() {
    const skills = await trpc.agent.readAllSkills().catch((error) => {
        if (error instanceof TRPCError) {
            if (error.code === "UNAUTHORIZED") {
                redirect("/auth/sign-in");
            }

            if (error.code === "FORBIDDEN") {
                redirect("/");
            }
        }

        throw error; // Re-throw unexpected errors
    });

    if (!skills) {
        return null;
    }

    return (
        <>
            <h1 className="mb-4 text-2xl font-bold">Skills Management</h1>
            <div className="space-y-4">
                <CreateSkillDialog />
                <SkillsTable initialSkills={skills} />
            </div>
        </>
    );
}
