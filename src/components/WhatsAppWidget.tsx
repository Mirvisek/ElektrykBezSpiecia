"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface WhatsAppWidgetProps {
    phone: string; // np. "48123456789" (format międzynarodowy bez +)
    message?: string; // domyślna wiadomość
}

export default function WhatsAppWidget({ phone, message }: WhatsAppWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Pokaż widget po 3 sekundach
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!phone) return null;

    const phoneClean = phone.replace(/[\s+\-()]/g, "");
    const defaultMessage = message || "Dzień dobry, chciałbym zapytać o usługę elektryczną.";
    const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(defaultMessage)}`;

    return (
        <div className={`fixed bottom-6 left-6 z-[100] flex flex-col items-start gap-3 transition-all duration-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>

            {/* Popup z wiadomością */}
            {isOpen && (
                <div className="bg-white dark:bg-[#0A1C3B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-72 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Elektryk Bez Spięcia</p>
                                <p className="text-xs text-green-100 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-300 rounded-full inline-block animate-pulse"></span>
                                    Zazwyczaj odpowiadamy natychmiast
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1" aria-label="Zamknij">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Dymek wiadomości */}
                    <div className="p-4 bg-[#E5DDD5] dark:bg-slate-800">
                        <div className="bg-white dark:bg-slate-700 rounded-lg rounded-tl-none p-3 shadow-sm max-w-[85%]">
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                                👋 Cześć! Masz pytanie lub potrzebujesz szybkiej pomocy elektrycznej? Napisz do nas na WhatsApp!
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 text-right">teraz</p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="p-3 bg-white dark:bg-[#0A1C3B] border-t border-slate-100 dark:border-slate-700">
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#25D366] hover:bg-[#1EA952] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                            onClick={() => setIsOpen(false)}
                        >
                            <Send className="w-4 h-4" />
                            Napisz wiadomość
                        </a>
                    </div>
                </div>
            )}

            {/* Przycisk WhatsApp */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative bg-[#25D366] hover:bg-[#1EA952] text-white p-4 rounded-full shadow-[0_4px_20px_rgba(37,211,102,0.5)] transition-all hover:scale-110 focus:ring-4 focus:ring-green-300 outline-none"
                aria-label="Napisz do nas na WhatsApp"
                title="Napisz do nas na WhatsApp"
            >
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>

                {/* Pulsująca kropka */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold animate-bounce">
                        1
                    </span>
                )}
            </button>
        </div>
    );
}
