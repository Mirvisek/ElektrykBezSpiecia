import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SeoEditorClient from "@/components/admin/SeoEditorClient";

export const metadata = {
    title: "Edytor SEO i Strony Głównej | Admin Panel",
};

export default async function SeoPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const [settings, heroSlides, advantages, services] = await Promise.all([
        prisma.siteSetting.findUnique({ where: { id: "global" } }),
        prisma.heroSlide.findMany({ orderBy: { order: "asc" } }),
        prisma.advantage.findMany({ orderBy: { order: "asc" } }),
        prisma.service.findMany({ orderBy: { order: "asc" } })
    ]);

    return (
        <SeoEditorClient
            initialSettings={settings}
            initialHeroSlides={heroSlides}
            initialAdvantages={advantages}
            initialServices={services}
        />
    );
}
