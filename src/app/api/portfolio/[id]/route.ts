import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

// PATCH: aktualizuj realizację
export async function PATCH(req: Request, { params }: Params) {
    const { id } = await params;
    const body = await req.json();

    const item = await prisma.portfolioItem.update({
        where: { id },
        data: {
            title: body.title,
            description: body.description ?? null,
            category: body.category ?? null,
            imageUrl: body.imageUrl ?? null,
            images: body.images ? JSON.stringify(body.images) : null,
            order: body.order ?? 0,
            isActive: body.isActive ?? true,
        },
    });

    return NextResponse.json({ success: true, item });
}

// DELETE: usuń realizację
export async function DELETE(_req: Request, { params }: Params) {
    const { id } = await params;
    await prisma.portfolioItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
