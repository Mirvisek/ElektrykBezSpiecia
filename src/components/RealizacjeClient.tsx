"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, PhoneCall, X, ChevronLeft, ChevronRight, FolderOpen } from "lucide-react";

const CATEGORIES_PL = ["Wszystkie"];

interface PortfolioItem {
    id: string;
    title: string;
    description?: string | null;
    category?: string | null;
    imageUrl?: string | null;
    images: string[];
    createdAt: Date;
}

export default function RealizacjeClient({
    settings,
    portfolio,
    categories,
}: {
    settings: any;
    portfolio: PortfolioItem[];
    categories: string[];
}) {
    const [activeCategory, setActiveCategory] = useState("Wszystkie");
    const [lightbox, setLightbox] = useState<{ item: PortfolioItem; imgIndex: number } | null>(null);

    const allCategories = ["Wszystkie", ...categories];

    const filtered = activeCategory === "Wszystkie"
        ? portfolio
        : portfolio.filter((i) => i.category === activeCategory);

    const openLightbox = (item: PortfolioItem, imgIndex = 0) => {
        setLightbox({ item, imgIndex });
    };

    const closeLightbox = () => setLightbox(null);

    const lightboxImages = lightbox
        ? [lightbox.item.imageUrl, ...lightbox.item.images].filter(Boolean) as string[]
        : [];

    const prevImg = () => {
        if (!lightbox) return;
        setLightbox({ ...lightbox, imgIndex: (lightbox.imgIndex - 1 + lightboxImages.length) % lightboxImages.length });
    };

    const nextImg = () => {
        if (!lightbox) return;
        setLightbox({ ...lightbox, imgIndex: (lightbox.imgIndex + 1) % lightboxImages.length });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] font-sans">
            {/* NAVBAR */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-[#0A1C3B]/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" fetchPriority="high" className="max-h-12 w-auto object-contain" />
                        ) : (
                            <>
                                <Zap className="h-8 w-8 text-brand-orange fill-current" />
                                <span className="text-xl font-bold dark:text-white leading-tight">
                                    Elektryk<br />
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400 block -mt-1">Bez Spięcia</span>
                                </span>
                            </>
                        )}
                    </Link>
                    <nav className="hidden md:flex gap-8">
                        <Link href="/#dlaczego-my" className="text-sm font-medium hover:text-brand-orange transition-colors dark:text-slate-200">Dlaczego My</Link>
                        <Link href="/#uslugi" className="text-sm font-medium hover:text-brand-orange transition-colors dark:text-slate-200">Usługi</Link>
                        {(settings?.portfolioActive !== false) && <Link href="/realizacje" className="text-sm font-medium text-brand-orange border-b-2 border-brand-orange pb-0.5">Realizacje</Link>}
                        {(settings?.blogActive !== false) && <Link href="/blog" className="text-sm font-medium hover:text-brand-orange transition-colors dark:text-slate-200">Blog</Link>}
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
            <section className="pt-28 pb-14 bg-brand-navy text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-brand-orange font-bold uppercase tracking-wider text-sm mb-3">Nasze prace</p>
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Realizacje</h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        Przeglądaj nasze ukończone projekty – od instalacji elektrycznych po kompleksowe montaże i usuwanie awarii.
                    </p>
                </div>
            </section>

            {/* CONTENT */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Filtry kategorii */}
                {allCategories.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-10">
                        {allCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${activeCategory === cat
                                    ? "bg-brand-orange text-white shadow-md shadow-brand-orange/30"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-brand-orange hover:text-brand-orange"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Siatka */}
                {filtered.length === 0 ? (
                    <div className="text-center py-24">
                        <FolderOpen className="w-20 h-20 text-slate-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-3">Brak realizacji</h2>
                        <p className="text-slate-500">Wkrótce dodamy nasze pierwsze realizacje. Zapraszamy wkrótce!</p>
                        <Link href="/kontakt" className="mt-8 inline-block bg-brand-orange text-white font-bold px-6 py-3 rounded-xl hover:bg-brand-orange-dark transition-colors">
                            Zapytaj o wycenę
                        </Link>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                        {filtered.map((item) => {
                            const allImgs = [item.imageUrl, ...item.images].filter(Boolean) as string[];
                            return (
                                <div
                                    key={item.id}
                                    className="break-inside-avoid bg-white dark:bg-[#0A1C3B] rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-xl transition-shadow group cursor-pointer"
                                    onClick={() => allImgs.length > 0 && openLightbox(item)}
                                >
                                    {/* Zdjęcie główne */}
                                    {item.imageUrl ? (
                                        <div className="overflow-hidden relative">
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                            {allImgs.length > 1 && (
                                                <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                                                    +{allImgs.length - 1} zdjęć
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-gradient-to-br from-brand-navy to-blue-900 flex items-center justify-center">
                                            <Zap className="w-12 h-12 text-brand-orange/20" />
                                        </div>
                                    )}

                                    {/* Opis */}
                                    <div className="p-5">
                                        {item.category && (
                                            <span className="inline-block bg-brand-orange/10 text-brand-orange text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                                                {item.category}
                                            </span>
                                        )}
                                        <h2 className="font-bold text-brand-navy dark:text-white text-base leading-snug mb-1 group-hover:text-brand-orange transition-colors">
                                            {item.title}
                                        </h2>
                                        {item.description && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">{item.description}</p>
                                        )}
                                        <p className="text-xs text-slate-400 mt-3">
                                            {new Date(item.createdAt).toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* CTA */}
                <div className="mt-20 bg-brand-navy text-white p-10 rounded-2xl text-center">
                    <Zap className="w-12 h-12 text-brand-orange mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3">Masz podobne zlecenie?</h2>
                    <p className="text-slate-400 mb-6 max-w-xl mx-auto">Skontaktuj się z nami, a wycenimy Twoje zlecenie bezpłatnie. Działamy szybko i solidnie!</p>
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
            </main>

            {/* LIGHTBOX */}
            {lightbox && lightboxImages.length > 0 && (
                <div
                    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
                        {/* Zamknij */}
                        <button onClick={closeLightbox} className="absolute -top-12 right-0 text-white/70 hover:text-white p-2 z-10">
                            <X className="w-7 h-7" />
                        </button>

                        {/* Zdjęcie */}
                        <img
                            src={lightboxImages[lightbox.imgIndex]}
                            alt={lightbox.item.title}
                            className="w-full max-h-[80vh] object-contain rounded-xl"
                        />

                        {/* Nawigacja */}
                        {lightboxImages.length > 1 && (
                            <>
                                <button onClick={prevImg}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-colors">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button onClick={nextImg}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-3 rounded-full transition-colors">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                                <div className="flex justify-center gap-1.5 mt-4">
                                    {lightboxImages.map((_, i) => (
                                        <button key={i} onClick={() => setLightbox({ ...lightbox, imgIndex: i })}
                                            className={`w-2 h-2 rounded-full transition-all ${i === lightbox.imgIndex ? "bg-brand-orange w-5" : "bg-white/40"}`} />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Info */}
                        <div className="mt-4 text-center">
                            {lightbox.item.category && (
                                <span className="inline-block bg-brand-orange/20 text-brand-orange text-xs font-bold px-3 py-1 rounded-full mb-2">{lightbox.item.category}</span>
                            )}
                            <h3 className="text-white font-bold text-lg">{lightbox.item.title}</h3>
                            {lightbox.item.description && <p className="text-slate-400 text-sm mt-1 max-w-xl mx-auto">{lightbox.item.description}</p>}
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER */}
            <footer className="bg-brand-navy text-slate-400 py-8 text-center text-sm mt-8">
                <p>© {new Date().getFullYear()} {settings?.title || "Elektryk Bez Spięcia"} ·{" "}
                    <Link href="/polityka-prywatnosci" className="underline hover:text-white">Polityka Prywatności</Link>
                </p>
            </footer>
        </div>
    );
}
