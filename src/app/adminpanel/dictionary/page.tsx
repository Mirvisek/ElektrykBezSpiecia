import { prisma } from "@/lib/prisma";
import DictionaryClient from "@/components/admin/DictionaryClient";

export default async function DictionaryAdminPage() {
    const terms = await prisma.dictionaryTerm.findMany({
        orderBy: { order: "asc" }
    });

    return <DictionaryClient initialTerms={terms} />;
}
