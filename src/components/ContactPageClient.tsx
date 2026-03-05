"use client";

import { Zap, PhoneCall, Mail, MapPin, Facebook, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

import { useState } from "react";

export default function ContactPageClient({ settings }: any) {
    const [messageLength, setMessageLength] = useState(0);

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
                        <Link href="/kontakt" className="text-sm font-medium text-brand-orange border-b-2 border-brand-orange pb-1 transition-colors">Kontakt</Link>
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

            {/* CONTACT HERO & FORM */}
            <main className="flex-1 pt-32 pb-24">
                <section className="bg-brand-orange text-brand-navy relative overflow-hidden py-16">
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                        <Zap className="w-full h-full text-brand-navy" />
                    </div>
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-8 sm:mb-12">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">Potrzebujesz pomocy elektryka?</h1>
                            <p className="text-brand-navy/80 text-base sm:text-lg">Wypełnij formularz poniżej, lub skontaktuj się z nami telefonicznie. Reagujemy błyskawicznie na każdą awarię!</p>
                        </div>
                        <form className="bg-white dark:bg-[#0A1C3B] p-8 rounded-2xl shadow-2xl" onSubmit={async (e) => {
                            e.preventDefault();
                            const f = e.target as any;
                            const res = await fetch("/api/contact", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name: f.name.value, phone: f.phone.value, email: f.email.value, message: f.message.value })
                            });
                            if (res.ok) {
                                alert("Wysłano zgłoszenie! Skontaktujemy się z Tobą bardzo szybko.");
                                f.reset();
                                setMessageLength(0);
                            }
                            else alert("Wystąpił błąd, spróbuj ponownie.");
                        }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Imię i nazwisko / Nazwa firmy <span className="text-red-500">*</span></label>
                                    <input name="name" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" placeholder="Jan Kowalski" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Numer telefonu <span className="text-red-500">*</span></label>
                                    <input name="phone" required type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" placeholder="123 456 789" />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adres email <span className="text-red-500">*</span></label>
                                <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" placeholder="kontakt@firma.pl" />
                            </div>
                            <div className="mb-6">
                                <label className="flex justify-between items-center text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    <span>Opis prac do wykonania / Awarii <span className="text-red-500">* (min. 100 znaków)</span></span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${messageLength < 100 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                        {messageLength} / 100+ znaków
                                    </span>
                                </label>
                                <textarea name="message" required minLength={100} rows={4} className={`w-full px-4 py-3 rounded-xl border ${messageLength > 0 && messageLength < 100 ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 dark:border-slate-700 focus:ring-brand-orange'} bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 outline-none transition-colors`} placeholder="Krótko opisz w czym możemy pomóc. Opisz szczegóły zlecenia, abyśmy mogli lepiej przygotować wycenę (minimum 100 znaków)..." onChange={(e) => setMessageLength(e.target.value.length)}></textarea>
                            </div>
                            <button type="submit" className="w-full bg-brand-navy hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors text-lg flex justify-center items-center gap-2">
                                <Zap className="w-5 h-5 text-brand-orange" />
                                Wyślij zgłoszenie
                            </button>
                        </form>
                    </div>
                </section>
            </main>

            {/* CALL TO ACTION & FOOTER */}
            <footer id="kontakt" className="bg-brand-navy text-slate-300 py-16">
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
