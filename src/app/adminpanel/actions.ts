"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { sendEmail, userWelcomeHtml, passwordChangedHtml, passwordResetHtml } from "@/lib/email";
import { randomBytes } from "crypto";

export async function addUser(data: { name: string; email: string; role: string }) {
    // Generujemy hasło tymczasowe (8 znaków)
    const tempPass = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPass, 10);

    const user = await (prisma as any).user.create({
        data: {
            ...data,
            password: hashedPassword,
            mustChangePassword: true // Wymuszamy zmianę przy logowaniu
        }
    });

    // Pobieramy konfigurację maila
    const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
    if (settings) {
        await sendEmail(settings as any, {
            to: data.email,
            subject: "Nowe konto administratora - Dane do logowania",
            html: userWelcomeHtml({
                name: data.name,
                email: data.email,
                tempPass: tempPass,
                loginUrl: `${process.env.NEXTAUTH_URL || ""}/login`
            })
        });
    }

    revalidatePath("/adminpanel/users");
}

export async function updateUser(id: string, data: { name?: string; email?: string; password?: string; role?: string }) {
    const userBefore = await prisma.user.findUnique({ where: { id } });
    const updateData: any = { ...data };
    let passChanged = false;

    if (data.password) {
        updateData.password = await bcrypt.hash(data.password, 10);
        passChanged = true;
    } else {
        delete updateData.password;
    }

    const userAfter = await (prisma as any).user.update({
        where: { id },
        data: updateData
    });

    // Powiadomienie o zmianie maila lub hasła
    const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
    if (settings && userAfter.email) {
        if (passChanged) {
            await sendEmail(settings as any, {
                to: userAfter.email,
                subject: "Twoje hasło zostało zmienione",
                html: passwordChangedHtml({ name: userAfter.name || "Użytkowniku" })
            });
        }
        // Jeśli zmienił się email, wyślij też info na stary
        if (userBefore?.email && userBefore.email !== userAfter.email) {
            await sendEmail(settings as any, {
                to: userBefore.email,
                subject: "Zmieniono adres e-mail do Twojego konta",
                html: `<p>Witaj, informujemy że adres e-mail do Twojego konta został zmieniony na: <b>${userAfter.email}</b>.</p>`
            });
        }
    }

    revalidatePath("/adminpanel/users");
}

export async function deleteUser(id: string) {
    // Zabezpieczenie przed usunięciem ostatniego admina lub samego siebie mogłoby być tu, 
    // ale na razie zrobimy prostą akcję.
    await prisma.user.delete({ where: { id } });
    revalidatePath("/adminpanel/users");
}

export async function requestPasswordReset(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return { success: false, error: "Użytkownik nie istnieje" };

        const token = randomBytes(32).toString("hex");
        const expiry = new Date(Date.now() + 3600000); // 1 godzina

        await (prisma as any).user.update({
            where: { id: user.id },
            data: { resetToken: token, resetTokenExpiry: expiry }
        });

        const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
        if (settings) {
            const mailResult = await sendEmail(settings as any, {
                to: email,
                subject: "Resetowanie hasła - Elektryk Bez Spięcia",
                html: passwordResetHtml({
                    name: user.name || "Użytkowniku",
                    resetUrl: `${process.env.NEXTAUTH_URL || ""}/login/reset?token=${token}`
                })
            });

            if (!mailResult.success) {
                return { success: false, error: "Nie udało się wysłać wiadomości: " + mailResult.error };
            }
        } else {
            return { success: false, error: "Brak konfiguracji e-mail w ustawieniach systemu." };
        }

        return { success: true };
    } catch (err: any) {
        console.error("Critical error in requestPasswordReset:", err);
        return { success: false, error: "Błąd serwera. Spróbuj ponownie później." };
    }
}

export async function finishForcePasswordChange(userId: string, newPass: string) {
    const hashedPassword = await bcrypt.hash(newPass, 10);
    const user = await (prisma as any).user.update({
        where: { id: userId },
        data: {
            password: hashedPassword,
            mustChangePassword: false
        }
    });

    const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
    if (settings && user.email) {
        await sendEmail(settings as any, {
            to: user.email,
            subject: "Twoje hasło zostało zaktualizowane",
            html: passwordChangedHtml({ name: user.name || "Użytkowniku" })
        });
    }

    revalidatePath("/");
    return { success: true };
}


export async function addTestimonial(data: { authorName: string; content: string; rating: number; order: number; isActive: boolean }) {
    await prisma.testimonial.create({ data });
    revalidatePath("/adminpanel/testimonials");
    revalidatePath("/");
}

export async function deleteTestimonial(id: string) {
    await prisma.testimonial.delete({ where: { id } });
    revalidatePath("/adminpanel/testimonials");
    revalidatePath("/");
}

// === SITE SETTINGS ===
export async function updateSiteSettings(data: any) {
    await prisma.siteSetting.upsert({
        where: { id: "global" },
        update: data,
        create: {
            id: "global",
            ...data
        }
    });
    revalidatePath("/adminpanel/seo");
    revalidatePath("/");
}

// === HERO SLIDES ===
export async function addHeroSlide(data: any) {
    await prisma.heroSlide.create({ data });
    revalidatePath("/adminpanel/seo");
    revalidatePath("/");
}
export async function deleteHeroSlide(id: string) {
    await prisma.heroSlide.delete({ where: { id } });
    revalidatePath("/adminpanel/seo");
    revalidatePath("/");
}

// === ADVANTAGES ===
export async function addAdvantage(data: any) {
    await prisma.advantage.create({ data });
    revalidatePath("/adminpanel/seo");
    revalidatePath("/");
}
export async function deleteAdvantage(id: string) {
    await prisma.advantage.delete({ where: { id } });
    revalidatePath("/adminpanel/seo");
    revalidatePath("/");
}

// === SERVICES ===
export async function addService(data: any) {
    await prisma.service.create({ data });
    revalidatePath("/adminpanel/seo");
    revalidatePath("/");
}
export async function deleteService(id: string) {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/adminpanel/seo");
    revalidatePath("/");
}

export async function testEmailConnection(toEmail: string) {
    const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
    if (!settings) return { success: false, error: "Brak ustawień strony" };

    const res = await sendEmail(settings as any, {
        to: toEmail,
        subject: "Test połączenia e-mail - Elektryk Bez Spięcia",
        html: `
            <div style="font-family: Arial; padding: 20px; border: 2px solid #f58e0b; border-radius: 12px;">
                <h2 style="color: #0D264E;">Sukces! ⚡</h2>
                <p>To jest wiadomość testowa. Jeśli ją widzisz, oznacza to że Twoja konfiguracja <b>${settings.emailProvider.toUpperCase()}</b> działa poprawnie.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #94a3b8;">Ta wiadomość została wysłana z Panelu Admina.</p>
            </div>
        `
    });

    return res;
}
