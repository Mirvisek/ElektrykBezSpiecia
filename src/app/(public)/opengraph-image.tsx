import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export const alt = 'Elektryk Bez Spięcia';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
    const settings = await prisma.siteSetting.findFirst({
        where: { id: "global" }
    });

    const title = settings?.title || 'Elektryk Bez Spięcia';
    const description = settings?.description || 'Profesjonalne instalacje elektryczne, pomiary i serwis.';

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#061125', // Brand Navy
                    padding: '60px',
                    position: 'relative',
                    textAlign: 'center',
                }}
            >
                {/* Decorative background element */}
                <div
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '800px',
                        height: '800px',
                        background: 'rgba(245, 142, 11, 0.1)', // Brand Orange with opacity
                        borderRadius: '50%',
                        filter: 'blur(150px)',
                    }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '100px', marginBottom: '10px' }}>⚡</div>
                        <h1 style={{ fontSize: '80px', color: '#F58E0B', fontWeight: 'bold', margin: '0' }}>{title}</h1>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <p
                        style={{
                            fontSize: '32px',
                            color: '#94a3b8',
                            maxWidth: '900px',
                            lineHeight: '1.4',
                            margin: '0',
                        }}
                    >
                        {description}
                    </p>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: '60px',
                        display: 'flex',
                        gap: '40px',
                        fontSize: '20px',
                        color: 'white',
                        opacity: 0.6,
                    }}
                >
                    <span>Instalacje</span>
                    <span>•</span>
                    <span>Pomiary</span>
                    <span>•</span>
                    <span>Awarie</span>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
