"use client";

import { useState, useEffect } from "react";
import { Accessibility, Type, Contrast, Link as LinkIcon, Minus, Plus, X } from "lucide-react";

export default function WcagWidget() {
    const [isOpen, setIsOpen] = useState(false);

    // States
    const [fontSize, setFontSize] = useState(100); // 100%, 120%, 140%
    const [highContrast, setHighContrast] = useState(false);
    const [highlightLinks, setHighlightLinks] = useState(false);

    useEffect(() => {
        // Load from local storage
        const savedSize = localStorage.getItem("wcag-font");
        const savedContrast = localStorage.getItem("wcag-contrast");
        const savedLinks = localStorage.getItem("wcag-links");

        if (savedSize) setFontSize(parseInt(savedSize));
        if (savedContrast === "true") setHighContrast(true);
        if (savedLinks === "true") setHighlightLinks(true);
    }, []);

    useEffect(() => {
        // Apply Font Size
        document.documentElement.style.fontSize = `${fontSize}%`;
        localStorage.setItem("wcag-font", fontSize.toString());

        // Apply High Contrast
        if (highContrast) {
            document.documentElement.classList.add("wcag-high-contrast");
        } else {
            document.documentElement.classList.remove("wcag-high-contrast");
        }
        localStorage.setItem("wcag-contrast", highContrast.toString());

        // Apply Link Highlight
        if (highlightLinks) {
            document.documentElement.classList.add("wcag-highlight-links");
        } else {
            document.documentElement.classList.remove("wcag-highlight-links");
        }
        localStorage.setItem("wcag-links", highlightLinks.toString());

    }, [fontSize, highContrast, highlightLinks]);

    const increaseFont = () => setFontSize(prev => Math.min(prev + 20, 160));
    const decreaseFont = () => setFontSize(prev => Math.max(prev - 20, 100));

    return (
        <>
            {/* Widget Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-[100] bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all hover:scale-110 focus:ring-4 focus:ring-blue-300 outline-none"
                aria-label="Panel Dostępności WCAG"
                title="Panel Dostępności WCAG"
            >
                <Accessibility className="w-7 h-7" />
            </button>

            {/* Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 z-[101] w-72 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-lg dark:text-white flex items-center gap-2">
                            <Accessibility className="w-5 h-5" />
                            Dostępność
                        </h2>
                        <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white" aria-label="Zamknij panel">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Font size */}
                        <div>
                            <p className="text-sm font-semibold mb-3 dark:text-slate-200 flex items-center gap-2">
                                <Type className="w-4 h-4" /> Wielkość czcionki
                            </p>
                            <div className="flex items-center gap-3">
                                <button onClick={decreaseFont} disabled={fontSize <= 100} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 py-2 rounded-lg flex justify-center items-center text-slate-800 dark:text-white" aria-label="Pomniejsz">
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-mono text-sm dark:text-white w-12 text-center">{fontSize}%</span>
                                <button onClick={increaseFont} disabled={fontSize >= 160} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 py-2 rounded-lg flex justify-center items-center text-slate-800 dark:text-white" aria-label="Powiększ">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* High Contrast */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setHighContrast(!highContrast)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${highContrast ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-slate-800"}`}
                            >
                                <Contrast className="w-5 h-5" />
                                Wysoki kontrast
                            </button>
                        </div>

                        {/* Highlight Links */}
                        <div>
                            <button
                                onClick={() => setHighlightLinks(!highlightLinks)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${highlightLinks ? "bg-blue-600 text-white" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-slate-800"}`}
                            >
                                <LinkIcon className="w-5 h-5" />
                                Podświetl linki
                            </button>
                        </div>

                        {/* Reset */}
                        <div className="pt-2">
                            <button
                                onClick={() => { setFontSize(100); setHighContrast(false); setHighlightLinks(false); }}
                                className="w-full text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white underline decoration-slate-300 underline-offset-4 font-medium"
                            >
                                Zresetuj ustawienia
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
