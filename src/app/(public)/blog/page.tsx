import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap, Calendar, ArrowRight, PhoneCall } from "lucide-react";
import Image from "next/image";

export const metadata = {
    title: "Blog | Elektryk Bez Spięcia",
    description: "Porady, aktualności i artykuły o elektryce, bezpieczeństwie instalacji i nowościach branżowych.",
};

export default async function BlogPage() {
    const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });

    if (settings?.blogActive === false) {
        redirect("/");
    }

    const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="bg-slate-50 dark:bg-[#061125] font-sans">

            {/* HERO */}
            <section className="pt-28 pb-12 bg-brand-navy text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-brand-orange font-bold uppercase tracking-wider text-sm mb-3">Wiedza i porady</p>
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Blog Elektryczny</h1>
                    <p className="text-slate-400 text-lg max-w-2xl">Praktyczne porady, aktualności i artykuły o bezpieczeństwie instalacji elektrycznych.</p>
                </div>
            </section>

            {/* POSTS */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {posts.length === 0 ? (
                    <div className="text-center py-24">
                        <div className="text-6xl mb-6">📝</div>
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-3">Brak artykułów</h2>
                        <p className="text-slate-500">Wkrótce pojawią się pierwsze artykuły. Zajrzyj do nas później!</p>
                        <Link href="/" className="mt-8 inline-block bg-brand-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-orange-dark transition-colors">
                            Wróć na stronę główną
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <article key={post.id} className="bg-white dark:bg-[#0A1C3B] rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                                {post.imageUrl && (
                                    <div className="aspect-video relative overflow-hidden">
                                        <Image
                                            src={post.imageUrl}
                                            alt={post.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                {!post.imageUrl && (
                                    <div className="aspect-video bg-gradient-to-br from-brand-navy to-blue-900 flex items-center justify-center">
                                        <Zap className="w-16 h-16 text-brand-orange/30" />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(post.createdAt).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
                                    </div>
                                    <h2 className="text-lg font-bold text-brand-navy dark:text-white mb-3 group-hover:text-brand-orange transition-colors leading-snug">
                                        {post.title}
                                    </h2>
                                    {post.excerpt && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">{post.excerpt}</p>
                                    )}
                                    <Link href={`/blog/${post.slug}`} className="flex items-center gap-2 text-brand-orange font-bold text-sm hover:gap-3 transition-all">
                                        Czytaj dalej <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

        </div>
    );
}
