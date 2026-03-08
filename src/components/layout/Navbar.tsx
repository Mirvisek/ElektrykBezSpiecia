"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, PhoneCall, Menu, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { SiteSetting } from "@/types/prisma";
import Image from "next/image";

interface NavbarProps {
    settings: SiteSetting | null;
}

export default function Navbar({ settings }: NavbarProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const isHomePage = pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        ...(settings?.aboutUsActive !== false ? [{ name: "O nas", href: "/o-nas" }] : []),
        { name: "Dlaczego My", href: "/#dlaczego-my" },
        { name: "Usługi", href: "/#uslugi" },
        ...(settings?.portfolioActive !== false ? [{ name: "Realizacje", href: "/realizacje" }] : []),
        ...(settings?.blogActive !== false ? [{ name: "Blog", href: "/blog" }] : []),
        ...(settings?.dictionaryActive !== false ? [{ name: "Słowniczek", href: "/slowniczek" }] : []),
        ...(settings?.clientZoneActive !== false ? [{ name: "Strefa Klienta", href: "/strefa-klienta" }] : []),
        { name: "Kontakt", href: "/kontakt" },
    ];

    const topBannerActive = settings?.topBannerActive && settings?.topBannerText;

    const showSolidNav = !isHomePage || isScrolled || isMobileMenuOpen;

    return (
        <header
            className={`fixed ${topBannerActive ? "top-8 sm:top-9" : "top-0"} left-0 w-full z-50 transition-all duration-300 ${showSolidNav
                ? "bg-white/90 dark:bg-[#0A1C3B]/95 backdrop-blur-md shadow-md border-b border-slate-200 dark:border-slate-800"
                : "bg-transparent"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-105">
                    {settings?.logoUrl ? (
                        <div className="relative h-12 w-32 sm:h-14 sm:w-40">
                            <Image
                                src={settings.logoUrl}
                                alt="Logo"
                                fill
                                priority
                                className={`object-contain transition-all duration-300 ${!showSolidNav ? "brightness-0 invert" : ""}`}
                            />
                        </div>
                    ) : (
                        <>
                            <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-brand-orange fill-current group-hover:animate-pulse" />
                            <span className={`text-lg sm:text-xl font-bold leading-tight block transition-colors ${showSolidNav ? "dark:text-white text-brand-navy" : "text-white"}`}>
                                Elektryk<br />
                                <span className={`text-[10px] sm:text-sm font-normal leading-tight block -mt-1 ${showSolidNav ? "text-slate-500 dark:text-slate-400" : "text-slate-300"}`}>
                                    Bez Spięcia
                                </span>
                            </span>
                        </>
                    )}
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-sm font-medium transition-colors hover:text-brand-orange ${showSolidNav
                                ? "text-brand-navy dark:text-slate-200"
                                : "text-white"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">


                    <a href={`tel:${settings?.contactPhone?.replace(/\s+/g, '')}`} className="hidden lg:block">
                        <button className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-4 py-2 sm:px-5 sm:py-2 rounded-xl text-sm transition-all shadow-lg shadow-brand-orange/30 flex items-center gap-2 hover:scale-105 active:scale-95">
                            <PhoneCall className="w-4 h-4" />
                            <span className="hidden sm:inline">{settings?.contactPhone}</span>
                            <span className="sm:hidden">Zadzwoń</span>
                        </button>
                    </a>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`md:hidden p-2 rounded-lg transition-colors ${showSolidNav
                            ? "text-brand-navy dark:text-white"
                            : "text-white"
                            }`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-[#0A1C3B] border-b border-slate-200 dark:border-slate-800"
                    >
                        <nav className="flex flex-col p-6 gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-bold text-brand-navy dark:text-white hover:text-brand-orange transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
