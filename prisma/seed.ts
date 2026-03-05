import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const user = await prisma.user.upsert({
        where: { email: 'admin@elektryk.pl' },
        update: {},
        create: {
            email: 'admin@elektryk.pl',
            name: 'Administrator',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    const settings = await prisma.siteSetting.upsert({
        where: { id: 'global' },
        update: {},
        create: {
            title: 'Elektryk Bez Spięcia',
            description: 'Profesjonalne usługi elektryczne, montaż i pomiary. Solidnie i bezpiecznie.',
            keywords: 'elektryk, pomiary',
            contactMail: 'kontakt@elektrykbezspiecia.pl',
            contactPhone: '+48 123 456 789'
        }
    })

    const slideCount = await prisma.heroSlide.count()
    if (slideCount === 0) {
        await prisma.heroSlide.create({
            data: {
                title: 'Elektryk Bez Spięcia',
                subtitle: 'Profesjonalne instalacje i pomiary elektryczne.',
                buttonText: 'Zadzwoń do nas',
                buttonLink: 'tel:+48123456789',
                order: 1,
            }
        })
    }

    const advCount = await prisma.advantage.count()
    if (advCount === 0) {
        await prisma.advantage.createMany({
            data: [
                { title: 'Szybki czas reakcji', description: 'Błyskawicznie na miejscu awarii w Krakowie i okolicach.', icon: 'Zap', order: 1 },
                { title: 'Uprawnienia SEP', description: 'Posiadamy wszystkie niezbędne kwalifikacje i mierniki.', icon: 'ShieldCheck', order: 2 },
                { title: 'Bezpieczeństwo na lata', description: 'Dajemy pisemną gwarancję na nasze instalacje.', icon: 'CheckCircle', order: 3 },
            ]
        })
    }

    const srvCount = await prisma.service.count()
    if (srvCount === 0) {
        await prisma.service.createMany({
            data: [
                { title: 'Pomiary elektryczne', description: 'Okresowe pomiary na najwyższej klasy miernikach Sonel z generowaniem protokołów (RCD, rezystancja itp.).', icon: 'Activity', order: 1 },
                { title: 'Awarie priorytetowe', description: 'Brak prądu w jednym obwodzie, zwarcia? Przyjeżdżamy natychmiast.', icon: 'AlertTriangle', order: 2 },
                { title: 'Montaż złącz', description: 'Montaż, modernizacja oraz wymiana całych rozdzielnic elektrycznych i automatyki.', icon: 'Cpu', order: 3 },
                { title: 'Instalacje domowe', description: 'Rozkładanie profesjonalnych instalacji od zera z podbiciem odpowiednimi pieczątkami.', icon: 'Home', order: 4 },
            ]
        })
    }

    const tmnCount = await prisma.testimonial.count()
    if (tmnCount === 0) {
        await prisma.testimonial.createMany({
            data: [
                { authorName: 'Marek z Krakowa', content: 'Szybka interwencja po burzy. Zdiagnozowali awarię i przywrócili prąd w 30 minut. Pełen profesjonalizm!', rating: 5, order: 1 },
                { authorName: 'Anna, właścicielka restauracji', content: 'Polecam w 100%. Pomiary wykonane bardzo szczegółowo, dostaliśmy protokoły potrzebne do nadzoru.', rating: 5, order: 2 },
                { authorName: 'Kamil, budowa na Ruczaju', content: 'Rozdzielnica zrobiona elegancko, poukładane, wszystko oznaczone. Czysta robota na czas i bez spięcia!', rating: 5, order: 3 },
            ]
        })
    }

    console.log("Seeding finished.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
