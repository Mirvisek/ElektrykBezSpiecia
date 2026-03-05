import nodemailer from "nodemailer";
import { Resend } from "resend";

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    from?: string;
}

interface MailConfig {
    emailProvider: string;
    smtpHost?: string | null;
    smtpPort?: number | null;
    smtpUser?: string | null;
    smtpPass?: string | null;
    smtpFrom?: string | null;
    resendApiKey?: string | null;
}

export async function sendEmail(config: MailConfig, options: EmailOptions): Promise<{ success: boolean; error?: string }> {
    const fromAddress = options.from || config.smtpFrom || "noreply@elektrykbezspiecia.pl";

    try {
        if (config.emailProvider === "resend" && config.resendApiKey) {
            const resend = new Resend(config.resendApiKey);
            await resend.emails.send({
                from: fromAddress,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            return { success: true };
        }

        if (config.emailProvider === "smtp" && config.smtpHost) {
            const transporter = nodemailer.createTransport({
                host: config.smtpHost,
                port: config.smtpPort || 587,
                secure: (config.smtpPort || 587) === 465,
                auth: {
                    user: config.smtpUser || "",
                    pass: config.smtpPass || "",
                },
            });

            await transporter.sendMail({
                from: fromAddress,
                to: options.to,
                subject: options.subject,
                html: options.html,
            });
            return { success: true };
        }

        return { success: false, error: "Brak konfiguracji email. Skonfiguruj SMTP lub Resend w panelu." };
    } catch (err: any) {
        console.error("Błąd wysyłania email:", err);
        return { success: false, error: err?.message || "Nieznany błąd" };
    }
}

// Szablony HTML e-maili
export function contactNotificationHtml(data: {
    name: string;
    phone: string;
    email?: string;
    message: string;
    siteName: string;
}) {
    return `
    <!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="UTF-8"><style>
        body { font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .card { background: white; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
        .header { background: #0D264E; color: white; padding: 20px 32px; border-radius: 12px 12px 0 0; margin: -32px -32px 24px; }
        .badge { display: inline-block; background: #f58e0b; color: white; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
        .row { margin: 16px 0; padding: 12px 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #f58e0b; }
        .label { font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-size: 15px; color: #0D264E; margin-top: 4px; font-weight: 600; }
        .message-box { background: #f0f9ff; border-radius: 8px; padding: 16px; margin-top: 16px; border: 1px solid #bae6fd; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px; }
    </style></head>
    <body>
    <div class="card">
        <div class="header">
            <div class="badge">⚡ Nowe Zgłoszenie</div>
            <h2 style="margin:0; font-size:20px;">${data.siteName}</h2>
        </div>
        <p style="color:#64748b;">Otrzymałeś nowe zgłoszenie z formularza kontaktowego. Szczegóły poniżej:</p>
        <div class="row"><div class="label">Imię / Firma</div><div class="value">${data.name}</div></div>
        <div class="row"><div class="label">Telefon</div><div class="value"><a href="tel:${data.phone.replace(/\s/g, '')}" style="color:#f58e0b;">${data.phone}</a></div></div>
        ${data.email ? `<div class="row"><div class="label">E-mail</div><div class="value"><a href="mailto:${data.email}" style="color:#f58e0b;">${data.email}</a></div></div>` : ''}
        <div class="message-box">
            <div class="label">Opis zgłoszenia</div>
            <p style="color:#334155; white-space:pre-wrap; margin:8px 0 0;">${data.message}</p>
        </div>
        <div class="footer">${data.siteName} · Powiadomienie automatyczne</div>
    </div>
    </body></html>`;
}

export function newsletterWelcomeHtml(data: { name?: string; siteName: string; unsubscribeUrl: string }) {
    return `
    <!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="UTF-8"><style>
        body { font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .card { background: white; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #0D264E, #1a3a6e); color: white; padding: 32px; border-radius: 12px 12px 0 0; margin: -32px -32px 24px; text-align: center; }
        .btn { display: inline-block; background: #f58e0b; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 16px 0; }
        .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px; }
        a.unsubscribe { color: #94a3b8; font-size: 11px; }
    </style></head>
    <body>
    <div class="card">
        <div class="header">
            <div style="font-size:40px; margin-bottom:12px;">⚡</div>
            <h1 style="margin:0; font-size:24px;">Witaj w newsletterze!</h1>
            <p style="margin:8px 0 0; opacity:0.8; font-size:14px;">${data.siteName}</p>
        </div>
        <p>Cześć${data.name ? ` <strong>${data.name}</strong>` : ''}! 👋</p>
        <p>Dziękujemy za zapisanie się do newslettera <strong>${data.siteName}</strong>. Od teraz będziesz pierwsza osoba, która dowie się o:</p>
        <ul>
            <li>Promocjach i sezonowych rabatach na usługi elektryczne</li>
            <li>Ważnych ogłoszeniach i nowościach</li>
            <li>Praktycznych poradach dotyczących bezpieczeństwa elektrycznego</li>
        </ul>
        <a href="tel:+48123456789" class="btn">📞 Zadzwoń do nas</a>
        <div class="footer">
            Jeśli nie chcesz więcej otrzymywać wiadomości, <a href="${data.unsubscribeUrl}" class="unsubscribe">kliknij tutaj aby się wypisać</a>.
        </div>
    </div>
    </body></html>`;
}
export function userWelcomeHtml(data: { name: string; email: string; tempPass: string; loginUrl: string }) {
    return `
    <!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="UTF-8"><style>
        body { font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .card { background: white; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; }
        .header { background: #0D264E; color: white; padding: 20px 32px; border-radius: 12px 12px 0 0; margin: -32px -32px 24px; text-align: center; }
        .badge { display: inline-block; background: #f58e0b; color: white; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
        .info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .btn { display: inline-block; background: #f58e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    </style></head>
    <body>
    <div class="card">
        <div class="header">
            <h2 style="margin:0;">Witaj w zespole! ⚡</h2>
        </div>
        <p>Cześć <strong>${data.name}</strong>!</p>
        <p>Twoje konto w panelu administratora <strong>Elektryk Bez Spięcia</strong> zostało utworzone.</p>
        <div class="info">
            <p style="margin:0 0 8px;"><strong>Twoje dane do logowania:</strong></p>
            <p style="margin:4px 0;">Email: <code>${data.email}</code></p>
            <p style="margin:4px 0;">Hasło tymczasowe: <code>${data.tempPass}</code></p>
        </div>
        <p style="font-size: 14px; color: #64748b;">Przy pierwszym logowaniu poprosimy Cię o zmianę hasła na własne.</p>
        <a href="${data.loginUrl}" class="btn">Zaloguj się do panelu</a>
    </div>
    </body></html>`;
}

export function passwordChangedHtml(data: { name: string }) {
    return `
    <!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="UTF-8"><style>
        body { font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .card { background: white; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; border-top: 4px solid #10b981; }
    </style></head>
    <body>
    <div class="card">
        <h3>Hasło zostało zmienione 🔐</h3>
        <p>Witaj <strong>${data.name}</strong>,</p>
        <p>Informujemy, że hasło do Twojego konta w panelu zostało właśnie zmienione.</p>
        <p>Jeśli to nie Ty dokonałeś tej zmiany, skontaktuj się niezwłocznie z głównym administratorem.</p>
    </div>
    </body></html>`;
}

export function passwordResetHtml(data: { name: string; resetUrl: string }) {
    return `
    <!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="UTF-8"><style>
        body { font-family: Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; }
        .card { background: white; border-radius: 12px; padding: 32px; max-width: 600px; margin: 0 auto; }
        .btn { display: inline-block; background: #0D264E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    </style></head>
    <body>
    <div class="card">
        <h2>Resetowanie hasła ⚡</h2>
        <p>Cześć <strong>${data.name}</strong>!</p>
        <p>Otrzymaliśmy prośbę o zresetowanie hasła do Twojego konta. Kliknij w poniższy przycisk, aby ustawić nowe hasło:</p>
        <a href="${data.resetUrl}" class="btn">Zresetuj hasło</a>
        <p style="margin-top:24px; font-size:12px; color:#94a3b8;">Link jest ważny przez 1 godzinę. Jeśli to nie Ty prosiłeś o reset, zignoruj tę wiadomość.</p>
    </div>
    </body></html>`;
}
