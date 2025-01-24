import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ticketStatusSchema } from "@/api/types";
import CustomerTicketsPageClient from "@/components/ticket/CustomerTicketsPageClient";
import { trpc } from "@/trpc/server";

export default async function CustomerTicketsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const status = z
        .union([ticketStatusSchema, z.literal("not_closed")])
        .optional()
        .safeParse((await searchParams).status);

    const tickets = await trpc.customer
        .readAllTickets({
            status: status.success ? status.data : undefined
        })
        .catch((error) => {
            if (error instanceof TRPCError) {
                if (error.code === "UNAUTHORIZED") {
                    redirect("/auth/sign-in");
                }
            }

            throw error; // Re-throw unexpected errors
        });

    if (!tickets) {
        return null;
    }

    return <CustomerTicketsPageClient initialTickets={tickets} />;
}
