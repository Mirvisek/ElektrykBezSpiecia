import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Zap, Calendar, ArrowRight, PhoneCall } from "lucide-react";

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
                        {(settings?.blogActive !== false) && <Link href="/blog" className="text-sm font-medium text-brand-orange border-b-2 border-brand-orange pb-0.5">Blog</Link>}
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
                                    <div className="aspect-video overflow-hidden">
                                        <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
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

            {/* FOOTER */}
            <footer className="bg-brand-navy text-slate-400 py-8 text-center text-sm">
                <p>© {new Date().getFullYear()} {settings?.title || "Elektryk Bez Spięcia"} ·{" "}
                    <Link href="/polityka-prywatnosci" className="underline hover:text-white">Polityka Prywatności</Link>
                </p>
            </footer>
        </div>
    );
}
