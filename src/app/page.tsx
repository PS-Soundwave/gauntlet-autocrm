"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";
import { trpc } from "@/trpc/client";

export default function Home() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Initialize Supabase client
    const supabase = createClient();

    // TRPC queries
    const pingQuery = trpc.hello.useQuery("world");
    const advancedPing = trpc.authedHello.useQuery();

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
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Welcome to Our App
                </h1>

                {/* Auth Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Magic Link Login
                    </h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                        >
                            {isLoading ? "Sending..." : "Send Magic Link"}
                        </button>
                    </form>
                    {message && (
                        <p className="mt-4 text-sm text-center text-gray-600">
                            {message}
                        </p>
                    )}
                </div>

                {/* TRPC Section */}
                <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-2">
                            Basic Ping
                        </h3>
                        <p className="text-gray-600">
                            Status:{" "}
                            {pingQuery.isLoading
                                ? "Loading..."
                                : pingQuery.data}
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-700 mb-2">
                            Advanced Ping
                        </h3>
                        <p className="text-gray-600">
                            Status:{" "}
                            {advancedPing.isLoading
                                ? "Loading..."
                                : advancedPing.data}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
