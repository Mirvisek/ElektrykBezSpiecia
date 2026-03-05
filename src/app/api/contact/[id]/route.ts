import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });

    try {
        const { status } = await req.json();
        const updated = await prisma.contactMessage.update({
            where: { id: params.id },
            data: { status }
        });
        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Brak uprawnień" }, { status: 401 });

    try {
        await prisma.contactMessage.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}
