import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MessagesClient from "@/components/admin/MessagesClient";

export const metadata = {
    title: "Zgłoszenia | Admin Panel",
};

export default async function MessagesPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" }
    });

    return <MessagesClient initialMessages={messages} />;
}
