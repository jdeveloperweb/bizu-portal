export const dynamic = "force-dynamic";

import StudentLayoutClient from "./StudentLayoutClient";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
    return <StudentLayoutClient>{children}</StudentLayoutClient>;
}
