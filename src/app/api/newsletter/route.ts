import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, newsletterWelcomeHtml } from "@/lib/email";

// Zapisz nowego subskrybenta
export async function POST(req: Request) {
    try {
        const { email, name } = await req.json();
        if (!email) return NextResponse.json({ error: "Podaj adres e-mail." }, { status: 400 });

        const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
        if (existing) {
            if (existing.isActive) return NextResponse.json({ error: "Ten adres jest już zapisany." }, { status: 409 });
            // Re-aktywacja
            await prisma.newsletterSubscriber.update({ where: { email }, data: { isActive: true, name: name || null } });
            return NextResponse.json({ success: true, message: "Ponownie zapisano do newslettera!" });
        }

        await prisma.newsletterSubscriber.create({ data: { email, name: name || null } });

        // Wyślij e-mail powitalny
        const settings = await prisma.siteSetting.findFirst();
        if (settings?.emailProvider) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
            await sendEmail(
                {
                    emailProvider: settings.emailProvider,
                    smtpHost: settings.smtpHost,
                    smtpPort: settings.smtpPort,
                    smtpUser: settings.smtpUser,
                    smtpPass: settings.smtpPass,
                    smtpFrom: settings.smtpFrom,
                    resendApiKey: settings.resendApiKey,
                },
                {
                    to: email,
                    subject: `Witaj w newsletterze ${settings.title || ""}!`,
                    html: newsletterWelcomeHtml({
                        name,
                        siteName: settings.title || "Elektryk Bez Spięcia",
                        unsubscribeUrl: `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
                    }),
                }
            );
        }

        return NextResponse.json({ success: true, message: "Zapisano do newslettera!" }, { status: 201 });
    } catch (err) {
        console.error("Newsletter error:", err);
        return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
    }
}

// Listuj subskrybentów (dla panelu admina)
export async function GET() {
    const subscribers = await prisma.newsletterSubscriber.findMany({
        orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(subscribers);
}
