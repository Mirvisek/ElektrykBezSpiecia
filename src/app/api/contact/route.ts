import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, contactNotificationHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, phone, email, message } = body;

        if (!name || !phone || !message) {
            return NextResponse.json(
                { error: "Wypełnij wszystkie wymagane pola (Imię, Telefon, Opis)." },
                { status: 400 }
            );
        }

        // Zapisz do bazy
        const newMessage = await prisma.contactMessage.create({
            data: {
                name,
                phone,
                email: email || null,
                message,
                status: "NEW",
            },
        });

        // Pobierz ustawienia mailingu
        const settings = await prisma.siteSetting.findFirst();

        // Wyślij powiadomienie e-mail jeśli skonfigurowane
        if (settings?.notificationEmail) {
            await sendEmail(
                {
                    emailProvider: settings.emailProvider || "smtp",
                    smtpHost: settings.smtpHost,
                    smtpPort: settings.smtpPort,
                    smtpUser: settings.smtpUser,
                    smtpPass: settings.smtpPass,
                    smtpFrom: settings.smtpFrom,
                    resendApiKey: settings.resendApiKey,
                },
                {
                    to: settings.notificationEmail,
                    subject: `⚡ Nowe zgłoszenie od ${name} – ${settings.title || "Strona"}`,
                    html: contactNotificationHtml({
                        name,
                        phone,
                        email,
                        message,
                        siteName: settings.title || "Elektryk Bez Spięcia",
                    }),
                }
            );
        }

        return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
    } catch (error) {
        console.error("Błąd podczas zapisywania zgłoszenia:", error);
        return NextResponse.json(
            { error: "Wystąpił błąd po stronie serwera. Spróbuj ponownie później." },
            { status: 500 }
        );
    }
}
