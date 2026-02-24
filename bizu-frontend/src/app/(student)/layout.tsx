import StudentSidebar from "@/components/StudentSidebar";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#F8FAFF]">
            <StudentSidebar />
            <main className="flex-1 overflow-y-auto pt-14 md:pt-0 w-full min-w-0">
                {children}
            </main>
        </div>
    );
}
