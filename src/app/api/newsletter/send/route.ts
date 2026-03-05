import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Wyślij newsletter do wszystkich aktywnych subskrybentów
export async function POST(req: Request) {
    try {
        const { subject, html } = await req.json();
        if (!subject || !html) {
            return NextResponse.json({ error: "Podaj temat i treść wiadomości." }, { status: 400 });
        }

        const settings = await prisma.siteSetting.findFirst();
        if (!settings) return NextResponse.json({ error: "Brak ustawień serwera." }, { status: 500 });

        const subscribers = await prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
        });

        if (subscribers.length === 0) {
            return NextResponse.json({ error: "Brak aktywnych subskrybentów." }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        let sent = 0;
        let failed = 0;

        for (const sub of subscribers) {
            const unsubLink = `${baseUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}`;
            const htmlWithFooter = `${html}
                <div style="margin-top:32px; padding-top:16px; border-top:1px solid #e2e8f0; text-align:center; font-size:12px; color:#94a3b8;">
                    <a href="${unsubLink}" style="color:#94a3b8;">Wypisz się z newslettera</a>
                </div>`;

            const result = await sendEmail(
                {
                    emailProvider: settings.emailProvider || "smtp",
                    smtpHost: settings.smtpHost,
                    smtpPort: settings.smtpPort,
                    smtpUser: settings.smtpUser,
                    smtpPass: settings.smtpPass,
                    smtpFrom: settings.smtpFrom,
                    resendApiKey: settings.resendApiKey,
                },
                { to: sub.email, subject, html: htmlWithFooter }
            );

            if (result.success) sent++;
            else failed++;
        }

        return NextResponse.json({ success: true, sent, failed });
    } catch (err) {
        console.error("Send newsletter error:", err);
        return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
    }
}
