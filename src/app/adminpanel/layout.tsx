import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ForcePasswordChange from "@/components/admin/ForcePasswordChange";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const mustChange = (session.user as any).mustChangePassword;

    return (
        <>
            {mustChange && (
                <ForcePasswordChange
                    userId={session.user.id || ""}
                    userEmail={session.user.email || ""}
                />
            )}
            {children}
        </>
    );
}
