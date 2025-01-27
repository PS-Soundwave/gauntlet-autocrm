"use client";

import { Tabs } from "@/components/shared/Tabs";

const tabs = [
    { name: "Users", href: "/admin/user" },
    { name: "Agents", href: "/admin/agent" },
    { name: "Skills", href: "/admin/skill" },
    { name: "Queues", href: "/admin/queue" }
];

export default function AdminNav() {
    return <Tabs tabs={tabs} />;
}
