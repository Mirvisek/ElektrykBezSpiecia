import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const settings = await prisma.siteSetting.findFirst({
        where: { id: "global" }
    });

    return {
        name: settings?.title || 'Elektryk Bez Spięcia',
        short_name: 'Elektryk',
        description: settings?.description || 'Profesjonalne usługi elektryczne i pomiary',
        start_url: '/',
        display: 'standalone',
        background_color: '#061125', // Brand Navy
        theme_color: '#F58E0B',      // Brand Orange
        icons: [
            {
                src: settings?.iconUrl || '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/icon-192.png', // Assuming we have or will have these standard sizes
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
