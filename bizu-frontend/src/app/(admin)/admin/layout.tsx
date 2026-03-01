"use client";

import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#F8FAFF]">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
