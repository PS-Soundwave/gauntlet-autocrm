import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import CreateSkillDialog from "@/components/admin/CreateSkillDialog";
import { SkillsTable } from "@/components/admin/SkillsTable";
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
            <div className="space-y-4">
                <CreateSkillDialog />
                <SkillsTable initialSkills={skills} />
            </div>
        </>
    );
}
