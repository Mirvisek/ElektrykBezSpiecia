"use client";

import { motion } from "framer-motion";
import {
    Zap,
    ShieldCheck,
    CheckCircle,
    Activity,
    AlertTriangle,
    Cpu,
    Home,
    Wrench,
    PhoneCall,
    Mail,
    MapPin,
    Facebook,
    Clock
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import NewsletterForm from "@/components/NewsletterForm";

// Helper mapowania ikon z bazy do komponentów
const ICONS: Record<string, any> = {
    Zap,
    ShieldCheck,
    CheckCircle,
    Activity,
    AlertTriangle,
    Cpu,
    Home,
    Wrench,
};

export default function LandingPageClient({
    settings,
    heroSlides,
    advantages,
    services,
    testimonials
}: any) {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Prosty interwał do automatycznej zmiany slajdów (jeśli więcej niż 1)
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    const slide = heroSlides[currentSlide] || heroSlides[0];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] text-brand-navy dark:text-slate-100 flex flex-col font-sans overflow-hidden">

            {/* TOP BANNER */}
            {settings?.topBannerActive && settings?.topBannerText && (
                <div className="fixed top-0 left-0 w-full z-[60] bg-brand-orange text-white py-2 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="truncate max-w-4xl">{settings.topBannerText}</span>
                </div>
            )}

            {/* HEADER / NAVBAR */}
            <header className={`fixed ${settings?.topBannerActive && settings?.topBannerText ? "top-8 sm:top-9" : "top-0"} left-0 w-full z-50 bg-white/80 dark:bg-[#0A1C3B]/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800 transition-all`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" fetchPriority="high" className="max-h-12 sm:max-h-14 w-auto object-contain" />
                        ) : (
                            <>
                                <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-brand-orange fill-current" />
                                <span className="text-lg sm:text-xl font-bold dark:text-white leading-tight block">
                                    Elektryk<br />
                                    <span className="text-[10px] sm:text-sm font-normal text-slate-500 dark:text-slate-400 leading-tight block -mt-1">Bez Spięcia</span>
                                </span>
                            </>
                        )}
                    </Link>
                    <nav className="hidden md:flex gap-8">
                        <Link href="/#dlaczego-my" className="text-sm font-medium hover:text-brand-orange transition-colors">Dlaczego My</Link>
                        <Link href="/#uslugi" className="text-sm font-medium hover:text-brand-orange transition-colors">Usługi</Link>
                        {(settings?.portfolioActive !== false) && <Link href="/realizacje" className="text-sm font-medium hover:text-brand-orange transition-colors">Realizacje</Link>}
                        {(settings?.blogActive !== false) && <Link href="/blog" className="text-sm font-medium hover:text-brand-orange transition-colors">Blog</Link>}
                        <Link href="/kontakt" className="text-sm font-medium hover:text-brand-orange transition-colors">Kontakt</Link>
                    </nav>
                    <a href={`tel:${settings?.contactPhone?.replace(/\s+/g, '')}`}>
                        <button className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-4 py-2 sm:px-5 sm:py-2 rounded-xl text-sm transition-all shadow-lg shadow-brand-orange/30 flex items-center gap-2">
                            <PhoneCall className="w-4 h-4" />
                            <span className="hidden sm:inline">{settings?.contactPhone}</span>
                            <span className="sm:hidden">Zadzwoń</span>
                        </button>
                    </a>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-brand-navy text-white min-h-[80vh] flex items-center">
                {/* Dekoracyjne tło z piorunem */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
                    <Zap className="w-full h-full text-brand-orange" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
                    {slide && (
                        <motion.div
                            key={slide.id}
                            initial={{ opacity: slide.id === heroSlides[0]?.id ? 1 : 0, y: slide.id === heroSlides[0]?.id ? 0 : 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-3xl"
                        >
                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight">
                                {slide.title}
                            </h1>
                            <p className="text-lg sm:text-xl lg:text-2xl text-slate-300 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
                                {slide.subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={slide.buttonLink || "/kontakt"}>
                                    <button className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange-dark text-white text-base sm:text-lg font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(245,142,11,0.4)] hover:shadow-[0_0_30px_rgba(245,142,11,0.6)]">
                                        {slide.buttonText}
                                    </button>
                                </Link>
                                <Link href="#uslugi">
                                    <button className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white text-base sm:text-lg font-bold px-8 py-4 rounded-xl transition-all border border-slate-600">
                                        Nasza Oferta
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* Indykatory Karuzeli */}
                    {heroSlides.length > 1 && (
                        <div className="absolute bottom-10 left-4 sm:left-6 lg:left-8 flex gap-2">
                            {heroSlides.map((_: any, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    className={`w-10 h-1.5 rounded-full transition-all ${idx === currentSlide ? 'bg-brand-orange' : 'bg-slate-700 cursor-pointer hover:bg-slate-500'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* WHY US (ZALETY) SECTION */}
            <section id="dlaczego-my" className="py-24 bg-white dark:bg-[#0A1C3B]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-brand-orange font-bold tracking-wider uppercase text-sm mb-2">Gwarancja Jakości</h2>
                        <h3 className="text-3xl lg:text-4xl font-extrabold text-brand-navy dark:text-white">Dlaczego my?</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {advantages.map((adv: any, index: number) => {
                            const IconComp = ICONS[adv.icon] || Zap;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    key={adv.id}
                                    className="bg-slate-50 dark:bg-[#061125] p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <div className="w-14 h-14 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <IconComp className="w-8 h-8 text-brand-orange" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3 dark:text-white">{adv.title}</h4>
                                    <p className="text-slate-600 dark:text-slate-400">{adv.description}</p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* SERVICES SECTION */}
            <section id="uslugi" className="py-24 bg-slate-50 dark:bg-[#061125]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                        <div>
                            <h2 className="text-brand-orange font-bold tracking-wider uppercase text-sm mb-2">Nasza Oferta</h2>
                            <h3 className="text-3xl lg:text-4xl font-extrabold text-brand-navy dark:text-white">Co możemy dla Ciebie zrobić?</h3>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 max-w-md md:text-right mt-4 md:mt-0">
                            {settings?.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((srv: any, index: number) => {
                            const IconComp = ICONS[srv.icon] || Wrench;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    key={srv.id}
                                    className="bg-white dark:bg-[#0A1C3B] p-8 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-orange dark:hover:border-brand-orange transition-colors group cursor-default shadow-sm"
                                >
                                    <IconComp className="w-10 h-10 text-brand-navy dark:text-slate-300 mb-6 group-hover:text-brand-orange transition-colors" />
                                    <h4 className="text-lg font-bold mb-3 dark:text-white group-hover:text-brand-orange transition-colors">{srv.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{srv.description}</p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            {testimonials && testimonials.length > 0 && (
                <section id="opinie" className="py-24 bg-white dark:bg-[#0A1C3B]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-brand-orange font-bold tracking-wider uppercase text-sm mb-2">Opinie Klientów</h2>
                            <h3 className="text-3xl lg:text-4xl font-extrabold text-brand-navy dark:text-white">Co mówią o nas inni?</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {testimonials.map((tmn: any, index: number) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    key={tmn.id}
                                    className="bg-slate-50 dark:bg-[#061125] p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
                                >
                                    <div className="flex gap-1 mb-4">
                                        {[...Array(tmn.rating)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-brand-orange fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6 italic">"{tmn.content}"</p>
                                    <p className="font-bold text-brand-navy dark:text-white">{tmn.authorName}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CALL TO ACTION & FOOTER */}
            <footer className="bg-brand-navy text-slate-300 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 pb-12 border-b border-slate-700">
                        <div className="lg:col-span-2">
                            <Link href="/">
                                <div className="flex items-center gap-2 mb-6">
                                    {settings?.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Logo" loading="lazy" className="max-h-12 sm:max-h-14 w-auto object-contain brightness-0 invert" />
                                    ) : (
                                        <>
                                            <Zap className="h-8 w-8 text-brand-orange fill-current" />
                                            <span className="text-2xl font-bold text-white block leading-tight">
                                                Elektryk<br />
                                                <span className="text-sm font-normal text-slate-400 block -mt-1">Bez Spięcia</span>
                                            </span>
                                        </>
                                    )}
                                </div>
                            </Link>
                            <p className="max-w-sm">
                                Skontaktuj się z nami w celu wyceny, darmowej konsultacji lub nagłej awarii. Jesteśmy do Twojej dyspozycji.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Kontakt</h4>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <PhoneCall className="w-5 h-5 text-brand-orange" />
                                    <a href={`tel:${settings?.contactPhone?.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{settings?.contactPhone}</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-brand-orange" />
                                    <a href={`mailto:${settings?.contactMail}`} className="hover:text-white transition-colors">{settings?.contactMail}</a>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-brand-orange shrink-0" />
                                    <span>{settings?.address}</span>
                                </li>
                                {settings?.workingHours && (
                                    <li className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-700/50">
                                        <Clock className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                                        <span className="whitespace-pre-line text-sm">{settings.workingHours}</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Social Media</h4>
                            <ul className="space-y-4">
                                {settings?.facebookUrl ? (
                                    <li>
                                        <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white transition-colors">
                                            <Facebook className="w-5 h-5 text-brand-orange" />
                                            Facebook
                                        </a>
                                    </li>
                                ) : (
                                    <li>
                                        <span className="text-slate-500 italic">Brak linków</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="lg:col-span-4">
                            <NewsletterForm />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-2 text-sm text-slate-500 text-center">
                        <p>{settings?.footerText}</p>
                        <span className="hidden md:inline">·</span>
                        <Link href="/polityka-prywatnosci" className="hover:text-slate-300 underline underline-offset-4 transition-colors">Polityka Prywatności</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
