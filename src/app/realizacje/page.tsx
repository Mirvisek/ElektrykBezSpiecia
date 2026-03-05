import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import RealizacjeClient from "@/components/RealizacjeClient";

export const metadata: Metadata = {
    title: "Realizacje | Elektryk Bez Spięcia",
    description: "Zobacz nasze realizacje – instalacje elektryczne, pomiary, montaż rozdzielnic i usuwanie awarii na terenie Tarnowa i okolic.",
};

export default async function RealizacjePage() {
    const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });

    if (settings?.portfolioActive === false) {
        redirect("/");
    }

    const items = await prisma.portfolioItem.findMany({
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    // Parsuj JSON images dla każdego wpisu
    const portfolio = items.map((item) => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
    }));

    const categories = Array.from(new Set(portfolio.map((i) => i.category).filter(Boolean))) as string[];

    return <RealizacjeClient settings={settings} portfolio={portfolio} categories={categories} />;
}
