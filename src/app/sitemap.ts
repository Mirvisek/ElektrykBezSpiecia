import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://elektrykbezspiecia.pl';

    // Fetch dynamic content
    const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true }
    });

    const staticRoutes = [
        '',
        '/realizacje',
        '/blog',
        '/kontakt',
        '/polityka-prywatnosci',
    ].map(route => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    const blogRoutes = posts.map(post => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...blogRoutes];
}
