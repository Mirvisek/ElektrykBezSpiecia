import { prisma } from "@/lib/prisma";
import PortfolioAdminClient from "@/components/admin/PortfolioAdminClient";

export default async function PortfolioAdminPage() {
    const items = await prisma.portfolioItem.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const portfolio = items.map((item) => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
    }));

    return <PortfolioAdminClient initialItems={portfolio} />;
}
