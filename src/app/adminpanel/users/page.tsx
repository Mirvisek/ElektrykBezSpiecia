import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserManagementClient from "@/components/admin/UserManagementClient";

export default async function UserManagementPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            email: true,
            name: true,
            role: true
        }
    });

    return (
        <UserManagementClient
            initialUsers={users}
            currentUserId={session.user.id || ""}
        />
    );
}
