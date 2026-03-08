import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { sendEmail, userWelcomeHtml } from '@/lib/email';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const clientEmail = formData.get('email') as string;
        const clientName = formData.get('name') as string;

        if (!file || !clientEmail) {
            return NextResponse.json({ success: false, message: 'Brak pliku lub adresu email klienta' }, { status: 400 });
        }

        // Zapis pliku lokalnie (w public/uploads/clients)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const originalName = file.name;
        const extension = originalName.split('.').pop();
        const uniqueFileName = `${Date.now()}-${randomBytes(4).toString('hex')}.${extension}`;

        const uploadDir = path.join(process.cwd(), 'public/uploads/clients');
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, uniqueFileName);
        await fs.writeFile(filePath, buffer);
        const fileUrl = `/uploads/clients/${uniqueFileName}`;

        // Sprawdź czy użytkownik istnieje w Prisma
        let user = await prisma.user.findUnique({ where: { email: clientEmail } });

        if (!user) {
            // Skoro nie ma usera, tworzymy mu nowe konto automatycznie jako CLIENT
            const tempPass = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPass, 10);

            user = await (prisma as any).user.create({
                data: {
                    name: clientName || clientEmail.split('@')[0],
                    email: clientEmail,
                    password: hashedPassword,
                    role: "CLIENT",
                    mustChangePassword: true
                }
            });

            // Wysyłamy e-mail powitalny
            const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
            if (settings) {
                await sendEmail(settings as any, {
                    to: clientEmail,
                    subject: "Dostęp do Strefy Klienta - Elektryk Bez Spięcia",
                    html: userWelcomeHtml({
                        name: clientName || "Kliencie",
                        email: clientEmail,
                        tempPass: tempPass,
                        loginUrl: `${process.env.NEXTAUTH_URL || ""}/login`
                    })
                });
            }
        }

        // Zapisz plik jako rekord ClientFile
        await (prisma as any).clientFile.create({
            data: {
                name: originalName,
                url: fileUrl,
                userId: user!.id
            }
        });

        // Opcjonalnie: wyślij e-mail do klienta "Udostępniono nowy dokument, wejdź by pobrać".

        return NextResponse.json({ success: true, url: fileUrl, message: "Plik wgrany i podpięty do klienta." });

    } catch (error) {
        console.error("Błąd api/client-files/upload:", error);
        return NextResponse.json({ success: false, message: 'Błąd serwera podczas wgrywania pliku' }, { status: 500 });
    }
}
