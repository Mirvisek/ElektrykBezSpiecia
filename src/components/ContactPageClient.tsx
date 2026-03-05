"use client";

import { Zap, PhoneCall, Mail, MapPin, Facebook, Clock, Send, MessageSquare, User, AtSign, Phone, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SiteSetting } from "@/types/prisma";

export default function ContactPageClient({ settings }: { settings: SiteSetting | null }) {
    const [messageLength, setMessageLength] = useState(0);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');

        const f = e.currentTarget;
        const formData = new FormData(f);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setStatus('success');
                f.reset();
                setMessageLength(0);
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-[#061125] text-brand-navy dark:text-slate-100 flex flex-col font-sans overflow-hidden">

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

                        <form className="bg-white dark:bg-[#0A1C3B] p-8 rounded-2xl shadow-2xl relative" onSubmit={handleSubmit}>
                            {status === 'success' && (
                                <div className="absolute inset-0 z-20 bg-white/95 dark:bg-[#0A1C3B]/95 rounded-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Zgłoszenie wysłane!</h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-6">Dziękujemy za kontakt. Nasz elektryk oddzwoni do Ciebie w przeciągu kilku minut!</p>
                                    <button
                                        type="button"
                                        onClick={() => setStatus('idle')}
                                        className="text-brand-orange font-bold hover:underline"
                                    >
                                        Wyślij kolejną wiadomość
                                    </button>
                                </div>
                            )}

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

                            {status === 'error' && (
                                <p className="text-red-500 text-sm mb-4 font-bold flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Wystąpił błąd podczas wysyłania. Spróbuj ponownie lub zadzwoń bezpośrednio.
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full bg-brand-navy hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl transition-all text-lg flex justify-center items-center gap-2 shadow-lg hover:shadow-brand-navy/20 active:scale-[0.98]"
                            >
                                {status === 'submitting' ? (
                                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Zap className="w-5 h-5 text-brand-orange" />
                                )}
                                {status === 'submitting' ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
                            </button>
                        </form>
                    </div>
                </section>
            </main>

        </div>
    );
}
