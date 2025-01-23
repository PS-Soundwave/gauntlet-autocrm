"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Tab {
    name: string;
    href: string;
}

interface TabsProps {
    tabs: Tab[];
}

export const Tabs = ({ tabs }: TabsProps) => {
    const pathname = usePathname();

    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            pathname === tab.href
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                            "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                        )}
                    >
                        {tab.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
};
