import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/user/UsersTable";
import { trpc } from "@/trpc/server";

export default async function UsersPage() {
    const users = await trpc.admin.readAllUsers().catch((error) => {
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

    if (!users) {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="mb-4 text-2xl font-bold">Users</h1>
            <UsersTable initialUsers={users} />
        </div>
    );
}
