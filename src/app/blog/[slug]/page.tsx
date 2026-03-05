import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Zap, Calendar, ArrowLeft, Clock, PhoneCall } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });
    if (!post) return { title: "Nie znaleziono wpisu" };

    return {
        title: `${post.title} | Blog Elektryka`,
        description: post.excerpt || post.content.slice(0, 160),
        openGraph: {
            title: post.title,
            description: post.excerpt || "",
            images: post.imageUrl ? [post.imageUrl] : [],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });

    if (settings?.blogActive === false) {
        redirect("/");
    }

    const post = await prisma.blogPost.findUnique({ where: { slug, isPublished: true } });

    if (!post) notFound();

    const readingTime = Math.max(1, Math.ceil(post.content.split(" ").length / 200));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] font-sans">
            {/* NAVBAR */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-[#0A1C3B]/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="max-h-12 w-auto object-contain" />
                        ) : (
                            <>
                                <Zap className="h-8 w-8 text-brand-orange fill-current" />
                                <span className="text-xl font-bold dark:text-white">Elektryk<br />
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400 leading-tight block -mt-1">Bez Spięcia</span>
                                </span>
                            </>
                        )}
                    </Link>
                    <nav className="hidden md:flex gap-8">
                        <Link href="/#dlaczego-my" className="text-sm font-medium hover:text-brand-orange transition-colors dark:text-slate-200">Dlaczego My</Link>
                        <Link href="/#uslugi" className="text-sm font-medium hover:text-brand-orange transition-colors dark:text-slate-200">Usługi</Link>
                        {(settings?.portfolioActive !== false) && <Link href="/realizacje" className="text-sm font-medium hover:text-brand-orange transition-colors dark:text-slate-200">Realizacje</Link>}
                        <Link href="/blog" className="text-sm font-medium text-brand-orange border-b-2 border-brand-orange pb-0.5">Blog</Link>
                        <Link href="/kontakt" className="text-sm font-medium hover:text-brand-orange transition-colors dark:text-slate-200">Kontakt</Link>
                    </nav>
                    <a href={`tel:${settings?.contactPhone?.replace(/\s+/g, "")}`}>
                        <button className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all shadow-lg shadow-brand-orange/30">
                            <PhoneCall className="w-4 h-4" />
                            <span className="hidden sm:inline">{settings?.contactPhone}</span>
                            <span className="sm:hidden">Zadzwoń</span>
                        </button>
                    </a>
                </div>
            </header>

            {/* HERO IMAGE */}
            <div className="pt-16">
                {post.imageUrl ? (
                    <div className="w-full aspect-[21/7] overflow-hidden">
                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" fetchPriority="high" />
                    </div>
                ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-brand-navy to-blue-900 flex items-center justify-center">
                        <Zap className="w-20 h-20 text-brand-orange/20" />
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.createdAt).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {readingTime} min czytania
                    </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy dark:text-white mb-6 leading-tight">
                    {post.title}
                </h1>

                {post.excerpt && (
                    <p className="text-xl text-slate-500 dark:text-slate-400 mb-8 border-l-4 border-brand-orange pl-5 italic leading-relaxed">
                        {post.excerpt}
                    </p>
                )}

                {/* Article body */}
                <div
                    className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-extrabold prose-headings:text-brand-navy dark:prose-headings:text-white prose-a:text-brand-orange prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* CTA */}
                <div className="mt-16 bg-brand-navy text-white p-8 rounded-2xl text-center">
                    <Zap className="w-10 h-10 text-brand-orange mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3">Potrzebujesz elektryka?</h2>
                    <p className="text-slate-400 mb-6">Skontaktuj się z nami – wycena jest bezpłatna, a czas reakcji błyskawiczny!</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href={`tel:${settings?.contactPhone?.replace(/\s+/g, "")}`}
                            className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-6 py-3 rounded-xl transition-colors">
                            📞 {settings?.contactPhone || "Zadzwoń"}
                        </a>
                        <Link href="/kontakt" className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                            Formularz kontaktowy
                        </Link>
                    </div>
                </div>

                <div className="mt-8">
                    <Link href="/blog" className="flex items-center gap-2 text-brand-orange font-bold hover:gap-3 transition-all">
                        <ArrowLeft className="w-5 h-5" /> Wszystkie artykuły
                    </Link>
                </div>
            </main>

            {/* Schema.org Article */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: post.title,
                        description: post.excerpt || "",
                        datePublished: post.createdAt.toISOString(),
                        dateModified: post.updatedAt.toISOString(),
                        image: post.imageUrl || "",
                        author: { "@type": "Organization", name: settings?.title || "Elektryk Bez Spięcia" },
                        publisher: { "@type": "Organization", name: settings?.title || "Elektryk Bez Spięcia" },
                    }),
                }}
            />

            {/* FOOTER */}
            <footer className="bg-brand-navy text-slate-400 py-8 text-center text-sm mt-16">
                <p>© {new Date().getFullYear()} {settings?.title} ·{" "}
                    <Link href="/polityka-prywatnosci" className="underline hover:text-white">Polityka Prywatności</Link>
                </p>
            </footer>
        </div>
    );
}
