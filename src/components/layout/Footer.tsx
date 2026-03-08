"use client";

import Link from "next/link";
import { Zap, PhoneCall, Mail, MapPin, Facebook, Clock } from "lucide-react";
import NewsletterForm from "@/components/NewsletterForm";
import { SiteSetting } from "@/types/prisma";
import Image from "next/image";
import { motion } from "framer-motion";

interface FooterProps {
    settings: SiteSetting | null;
}

export default function Footer({ settings }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-brand-navy text-slate-300 py-16 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 pb-12 border-b border-slate-700">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-2"
                    >
                        <Link href="/" className="inline-block group transition-all hover:scale-105">
                            <div className="flex items-center gap-2 mb-6">
                                {settings?.logoUrl ? (
                                    <div className="relative h-12 w-32 sm:h-14 sm:w-40">
                                        <Image
                                            src={settings.logoUrl}
                                            alt="Logo"
                                            fill
                                            className="object-contain brightness-0 invert"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <Zap className="h-8 w-8 text-brand-orange fill-current group-hover:animate-pulse" />
                                        <span className="text-2xl font-bold text-white block leading-tight">
                                            Elektryk<br />
                                            <span className="text-sm font-normal text-slate-400 block -mt-1">Bez Spięcia</span>
                                        </span>
                                    </>
                                )}
                            </div>
                        </Link>
                        <p className="max-w-sm leading-relaxed text-slate-400">
                            Specjalizujemy się w instalacjach elektrycznych, pomiarach i szybkim usuwaniu awarii.
                            Zaufaj profesjonalistom i zapomnij o problemach z prądem!
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm border-l-4 border-brand-orange pl-3">Kontakt</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 group">
                                <PhoneCall className="w-5 h-5 text-brand-orange group-hover:scale-110 transition-transform" />
                                <a href={`tel:${settings?.contactPhone?.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{settings?.contactPhone}</a>
                            </li>
                            <li className="flex items-center gap-3 group">
                                <Mail className="w-5 h-5 text-brand-orange group-hover:scale-110 transition-transform" />
                                <a href={`mailto:${settings?.contactMail}`} className="hover:text-white transition-colors">{settings?.contactMail}</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-brand-orange shrink-0" />
                                <span className="text-sm">{settings?.address}</span>
                            </li>
                            {settings?.workingHours && (
                                <li className="flex items-start gap-3 mt-6 pt-6 border-t border-slate-700/50">
                                    <Clock className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                                    <span className="whitespace-pre-line text-sm text-slate-400 italic font-medium">{settings.workingHours}</span>
                                </li>
                            )}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm border-l-4 border-brand-orange pl-3">Social Media</h4>
                        <ul className="space-y-4">
                            {settings?.facebookUrl ? (
                                <li>
                                    <a
                                        href={settings.facebookUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-3 hover:text-white transition-all hover:translate-x-1 group"
                                    >
                                        <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all">
                                            <Facebook className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-sm">Dołącz do nas na Facebooku</span>
                                    </a>
                                </li>
                            ) : (
                                <li>
                                    <span className="text-slate-500 italic text-sm">Brak dostępnych linków</span>
                                </li>
                            )}
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="lg:col-span-4 mt-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700"
                    >
                        <NewsletterForm />
                    </motion.div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <p className="text-sm font-medium">{settings?.footerText || `© ${currentYear} Elektryk Bez Spięcia. Wszelkie prawa zastrzeżone.`}</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                        <Link href="/polityka-prywatnosci" className="hover:text-white underline underline-offset-4 decoration-brand-orange/40 hover:decoration-brand-orange transition-all">Polityka Prywatności</Link>
                        <Link href="/kontakt" className="hover:text-white transition-colors">Formularz Zgłoszeniowy</Link>
                    </div>
                </div>

                <div className="mt-8 text-center text-[10px] text-slate-500 uppercase tracking-[0.2em]">
                    Realizacja: <span className="text-slate-400 font-bold">Michał Dygdoń</span>
                </div>
            </div>
        </footer>
    );
}
