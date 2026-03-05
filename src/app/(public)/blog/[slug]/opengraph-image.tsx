import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; // Using nodejs for prisma access if on a traditional server, but standard prisma needs nodejs anyway

export const alt = 'Blog Elektryka';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Fetch dynamic content
    const post = await prisma.blogPost.findUnique({
        where: { slug },
        select: { title: true, excerpt: true }
    });

    const settings = await prisma.siteSetting.findFirst({
        where: { id: "global" }
    });

    if (!post) {
        return new ImageResponse(
            (
                <div style={{ display: 'flex', background: '#061125', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    Post not found
                </div>
            )
        );
    }

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    background: '#061125', // Brand Navy
                    padding: '80px',
                    position: 'relative',
                }}
            >
                {/* Decorative background element */}
                <div
                    style={{
                        position: 'absolute',
                        right: '-100px',
                        top: '-100px',
                        width: '500px',
                        height: '500px',
                        background: 'rgba(245, 142, 11, 0.15)', // Brand Orange with opacity
                        borderRadius: '50%',
                        filter: 'blur(100px)',
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <div
                        style={{
                            width: '24px',
                            height: '60px',
                            background: '#F58E0B',
                            marginRight: '15px',
                            borderRadius: '4px',
                        }}
                    />
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#F58E0B', letterSpacing: '4px', textTransform: 'uppercase' }}>
                        Blog Elektryka
                    </span>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <h1
                        style={{
                            fontSize: '64px',
                            fontWeight: 'bold',
                            color: 'white',
                            lineHeight: '1.1',
                            marginBottom: '20px',
                            maxWidth: '1000px',
                        }}
                    >
                        {post.title}
                    </h1>

                    {post.excerpt && (
                        <p
                            style={{
                                fontSize: '28px',
                                color: '#94a3b8',
                                maxWidth: '800px',
                                lineHeight: '1.4',
                            }}
                        >
                            {post.excerpt.slice(0, 160)}...
                        </p>
                    )}
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '80px',
                        left: '80px',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <span style={{ color: 'white', fontSize: '24px', opacity: 0.8 }}>
                        {settings?.title || 'Elektryk Bez Spięcia'}
                    </span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
