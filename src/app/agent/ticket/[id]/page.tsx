import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import AgentTicketContent from "@/components/ticket/AgentTicketContent";
import { trpc } from "@/trpc/server";

export default async function TicketPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const ticket = await trpc.agent
        .readTicket((await params).id)
        .catch((error) => {
            if (error instanceof TRPCError) {
                if (error.code === "UNAUTHORIZED") {
                    redirect("/auth/sign-in");
                }

                // TODO: For FORBIDDEN or NOT_FOUND, return null to show blank page
                return null;
            }

            throw error; // Re-throw unexpected errors
        });

    if (!ticket) {
        return null; // Return blank page for forbidden/not found
    }

    return <AgentTicketContent ticket={ticket} />;
}
