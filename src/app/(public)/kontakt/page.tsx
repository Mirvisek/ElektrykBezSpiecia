import { prisma } from "@/lib/prisma";
import ContactPageClient from "@/components/ContactPageClient";

export const metadata = {
    title: "Kontakt | Elektryk Bez Spięcia",
    description: "Skontaktuj się z nami w celu wyceny, darmowej konsultacji lub nagłej awarii. Jesteśmy do Twojej dyspozycji.",
};

export default async function KontaktPage() {
    const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });

    return <ContactPageClient settings={settings} />;
}
