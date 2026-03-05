import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
        return new NextResponse("<p>Błąd: brak adresu e-mail.</p>", { headers: { "Content-Type": "text/html" } });
    }

    await prisma.newsletterSubscriber.updateMany({
        where: { email },
        data: { isActive: false },
    });

    return new NextResponse(`
        <!DOCTYPE html><html lang="pl"><head><meta charset="UTF-8">
        <title>Wypisano z newslettera</title>
        <style>body{font-family:sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f1f5f9;}
        .box{background:white;padding:40px;border-radius:16px;text-align:center;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,.08);}
        h1{color:#0D264E;} p{color:#64748b;} a{color:#f58e0b;}</style></head>
        <body><div class="box">
            <div style="font-size:48px;">✅</div>
            <h1>Wypisano pomyślnie</h1>
            <p>Adres <strong>${email}</strong> został usunięty z listy subskrybentów.</p>
            <a href="/">Wróć na stronę główną</a>
        </div></body></html>
    `, { headers: { "Content-Type": "text/html" } });
}
