"use client";

import { useState } from "react";
import { createClient } from "@/supabase/client";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const supabase = createClient();

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
        <div className="flex h-screen flex-col">
            {/* Header Bar */}
            <div className="flex items-center border-b border-gray-200 bg-white px-6 py-2">
                <h1 className="text-base font-medium text-gray-900">Sign In</h1>
            </div>

            <div className="flex flex-1 items-center justify-center bg-gray-100 p-8">
                <div className="w-full max-w-md space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-gray-700"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-md bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                        >
                            {isLoading ? "Sending..." : "Send Magic Link"}
                        </button>
                    </form>

                    {message && (
                        <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
