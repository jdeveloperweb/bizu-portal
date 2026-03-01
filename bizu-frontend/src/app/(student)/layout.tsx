"use client";

import { usePathname } from "next/navigation";
import StudentSidebar from "@/components/StudentSidebar";
import FloatingPomodoro from "@/components/pomodoro/FloatingPomodoro";
import ChallengeOverlay from "@/components/arena/ChallengeOverlay";
import ActiveBuffsAura from "@/components/ActiveBuffsAura";
import { useAuth } from "@/components/AuthProvider";


export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { isAdmin } = useAuth();
    const isCheckoutRoute = pathname?.startsWith("/checkout");

    if (isAdmin && !pathname?.startsWith("/admin")) {
        if (typeof window !== "undefined") {
            window.location.href = "/admin";
        }
        return null;
    }

    if (isCheckoutRoute) {
        return <main className="min-h-screen bg-background text-foreground">{children}</main>;
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <StudentSidebar />
            <main className="flex-1 overflow-y-auto pt-[calc(4rem+env(safe-area-inset-top))] md:pt-0 w-full min-w-0">
                {children}
            </main>
            <FloatingPomodoro />
            <ChallengeOverlay />
            <ActiveBuffsAura />
        </div>
    );
}
