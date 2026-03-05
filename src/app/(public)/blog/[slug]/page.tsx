import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Zap, Calendar, ArrowLeft, Clock, PhoneCall } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

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
        <div className="bg-slate-50 dark:bg-[#061125] font-sans">

            {/* HERO IMAGE */}
            <div className="pt-16">
                {post.imageUrl ? (
                    <div className="w-full aspect-[21/7] relative overflow-hidden">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            fill
                            priority
                            className="object-cover"
                        />
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

        </div>
    );
}
