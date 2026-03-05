import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: lista realizacji
export async function GET() {
    const items = await prisma.portfolioItem.findMany({
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(items);
}

// POST: utwórz realizację
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description, category, imageUrl, images, order } = body;

        if (!title) return NextResponse.json({ error: "Tytuł jest wymagany." }, { status: 400 });

        const item = await prisma.portfolioItem.create({
            data: {
                title,
                description: description || null,
                category: category || null,
                imageUrl: imageUrl || null,
                images: images ? JSON.stringify(images) : null,
                order: order ?? 0,
                isActive: true,
            },
        });

        return NextResponse.json({ success: true, item }, { status: 201 });
    } catch (err) {
        console.error("Portfolio POST error:", err);
        return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
    }
}
