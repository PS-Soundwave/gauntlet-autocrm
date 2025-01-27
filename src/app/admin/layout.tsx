import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto p-4">
            <AdminNav />
            <div className="mt-6">{children}</div>
        </div>
    );
}
