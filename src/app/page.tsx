import { Button } from "@/components/shared/Button";

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="mb-8 text-4xl font-bold">Auto CRM</h1>
            <Button asChild>
                <a href="/auth/sign-in">Sign In</a>
            </Button>
        </main>
    );
}
