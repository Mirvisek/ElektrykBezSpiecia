import { prisma } from "@/lib/prisma";
import SlowniczekClient from "@/components/SlowniczekClient";

export const metadata = {
    title: "Słowniczek Elektryczny | Elektryk Bez Spięcia",
    description: "Proste wyjaśnienie skomplikowanych pojęć elektrycznych. Piszemy językiem zrozumiałym dla każdego.",
};

export default async function DictionaryPage() {
    const terms = await prisma.dictionaryTerm.findMany({
        orderBy: { order: "asc" },
        where: { isActive: true }
    });

    return <SlowniczekClient terms={terms} />;
}
