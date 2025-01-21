"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/supabase/client";

export default function Home() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Initialize Supabase client
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user }
            } = await supabase.auth.getUser();
            setUserId(user?.id ?? null);
        };

        getUser();

        // Subscribe to auth state changes
        const {
            data: { subscription }
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserId(session?.user?.id ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}`
                }
            });

            if (error) {
                setMessage("Error sending magic link");
                console.error(error);
            } else {
                setMessage("Check your email for the magic link!");
            }
        } catch (error) {
            console.error(error);
            setMessage("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
            <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-lg">
                <h1 className="mb-6 text-3xl font-bold text-gray-800">
                    Welcome to Our App
                </h1>

                {/* Auth Section */}
                <div className="mb-8">
                    <h2 className="mb-4 text-xl font-semibold text-gray-700">
                        Magic Link Login
                    </h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-lg bg-purple-600 px-4 py-2 font-bold text-white transition duration-200 hover:bg-purple-700 disabled:opacity-50"
                        >
                            {isLoading ? "Sending..." : "Send Magic Link"}
                        </button>
                    </form>
                    {message && (
                        <p className="mt-4 text-center text-sm text-gray-600">
                            {message}
                        </p>
                    )}
                </div>

                {/* Status Section */}
                <div className="space-y-6">
                    <div className="rounded-lg bg-gray-50 p-4">
                        <h3 className="mb-2 font-medium text-gray-700">
                            Basic Ping
                        </h3>
                        <p className="text-gray-600">Status: world</p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                        <h3 className="mb-2 font-medium text-gray-700">
                            User ID
                        </h3>
                        <p className="text-gray-600">
                            {userId ? userId : "Not signed in"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
