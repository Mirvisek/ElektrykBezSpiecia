"use client";

import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookieConsent", "accepted");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-[100] bg-white dark:bg-[#0A1C3B] border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-4 sm:p-6 pb-8 sm:pb-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex gap-4 items-start">
                    <div className="p-3 bg-brand-orange/10 rounded-full shrink-0">
                        <Cookie className="w-6 h-6 text-brand-orange" />
                    </div>
                    <div>
                        <h3 className="font-bold text-brand-navy dark:text-white mb-1">Cenimy Twoją prywatność</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                            Nasza strona używa plików cookies w celu świadczenia usług na najwyższym poziomie oraz do celów analitycznych (m.in. Google Analytics, Meta Pixel). Dalsze korzystanie z witryny oznacza zgodę na ich użycie.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                    <button
                        onClick={acceptCookies}
                        className="w-full sm:w-auto px-8 py-3 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                    >
                        Rozumiem i akceptuję
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
                        aria-label="Zamknij"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}
