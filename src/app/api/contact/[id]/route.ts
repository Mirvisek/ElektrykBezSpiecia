import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });

    try {
        const { id } = await params;
        const { status } = await req.json();
        const updated = await prisma.contactMessage.update({
            where: { id },
            data: { status }
        });
        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });

    try {
        const { id } = await params;
        await prisma.contactMessage.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
