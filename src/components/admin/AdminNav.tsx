"use client";

import { Tabs } from "@/components/shared/Tabs";

const tabs = [
    { name: "Users", href: "/user" },
    { name: "Agents", href: "/agent" },
    { name: "Skills", href: "/skill" }
];

export default function AdminNav() {
    return <Tabs tabs={tabs} />;
}
