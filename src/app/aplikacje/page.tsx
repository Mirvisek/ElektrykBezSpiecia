import CrmWrapper from "@/components/CrmWrapper";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "CRM | Elektryk Bez Spięcia",
    description: "Aplikacje i narzędzia rozliczeniowe.",
};

export default async function AplikacjePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <>
            <CrmWrapper />
        </>
    );
}
