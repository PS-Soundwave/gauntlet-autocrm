export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="mb-8 text-4xl font-bold">Auto CRM</h1>
            <a
                href="/auth/sign-in"
                className="rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
                Sign In
            </a>
        </main>
    );
}
