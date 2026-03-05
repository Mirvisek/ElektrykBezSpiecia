import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
    const email = 'admin@elektrykbezspiecia.pl';
    // Generowanie losowego hasła (8 znaków, litery i cyfry)
    const password = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 10);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
        },
        create: {
            email,
            password: hashedPassword,
            role: 'ADMIN',
            name: 'Administrator',
        },
    });

    console.log('\n=========================================');
    console.log('   RESTART KONTA ADMINISTRATORA');
    console.log('=========================================');
    console.log(`Login: ${email}`);
    console.log(`Hasło: ${password}`);
    console.log('=========================================');
    console.log('Możesz teraz zalogować się na stronie /login\n');
}

resetAdmin()
    .catch((e) => {
        console.error('BŁĄD PODCZAS RESTARTU:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
