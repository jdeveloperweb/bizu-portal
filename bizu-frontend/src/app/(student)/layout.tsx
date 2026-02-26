"use client";

import { usePathname } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import FloatingPomodoro from "@/components/pomodoro/FloatingPomodoro";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isCheckoutRoute = pathname?.startsWith("/checkout");

    if (isCheckoutRoute) {
        return <main className="min-h-screen bg-background text-foreground">{children}</main>;
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <StudentSidebar />
            <main className="flex-1 overflow-y-auto pt-14 md:pt-0 w-full min-w-0">
                {children}
            </main>
            <FloatingPomodoro />
        </div>
    );
}
