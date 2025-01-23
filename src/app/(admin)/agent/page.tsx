import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { AgentsTable } from "@/components/agent/AgentsTable";
import { trpc } from "@/trpc/server";

export default async function AgentsPage() {
    const agents = await trpc.admin.readAgents().catch((error) => {
        if (error instanceof TRPCError) {
            if (error.code === "UNAUTHORIZED") {
                redirect("/auth/sign-in");
            }

            if (error.code === "FORBIDDEN") {
                redirect("/");
            }
        }

        throw error;
    });

    if (!agents) {
        return null;
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Agents</h1>
            <AgentsTable initialAgents={agents} />
        </div>
    );
}
