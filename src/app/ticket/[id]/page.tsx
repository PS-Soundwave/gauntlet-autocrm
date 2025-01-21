import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import CustomerTicketContent from "@/components/ticket/CustomerTicketContent";
import { trpc } from "@/trpc/server";

export default async function CustomerTicketPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const ticket = await trpc.customer
        .readTicket((await params).id)
        .catch((error) => {
            if (error instanceof TRPCError) {
                if (error.code === "UNAUTHORIZED") {
                    redirect("/sign-in");
                }
                // TODO: For FORBIDDEN or NOT_FOUND, return null to show blank page
                return null;
            }

            throw error; // Re-throw unexpected errors
        });

    if (!ticket) {
        return null;
    }

    return <CustomerTicketContent ticket={ticket} />;
}
