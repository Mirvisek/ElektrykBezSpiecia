"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Award, Zap, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutUsPage() {
    return (
        <div className="bg-slate-50 dark:bg-[#061125] min-h-screen pt-24 sm:pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="text-center mb-16 sm:mb-24">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-navy dark:text-white tracking-tight mb-4"
                    >
                        O nas
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="w-24 h-1 bg-brand-orange mx-auto rounded-full mb-6"
                    />
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto"
                    >
                        Poznaj ludzi, którym możesz bezpiecznie powierzyć każdą instalację.
                    </motion.p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 sm:mb-32">

                    {/* Text Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-2 lg:order-1 space-y-6"
                    >
                        <h2 className="text-3xl font-bold text-brand-navy dark:text-white">
                            Doświadczenie i pasja do prądu
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            W <strong>Elektryk Bez Spięcia</strong> wierzymy, że dobra instalacja to taka, o której nie musisz na co dzień pamiętać – po prostu działa. Jesteśmy zespołem profesjonalnych elektryków z wieloletnim doświadczeniem w branży.
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                            Od prostych awarii po zaawansowane układy w nowych domach czy biurach, zawsze podchodzimy do problemu z precyzją, używając wyłącznie atestowanych i sprawdzonych materiałów.
                        </p>

                        <ul className="space-y-4 pt-4">
                            {[
                                "Pełne uprawnienia SEP",
                                "Profesjonalne zaplecze sprzętowe (Sonel, Fluke)",
                                "Gwarancja na wykonane prace",
                                "Brak ukrytych kosztów – przed pracą wycena"
                            ].map((item, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium"
                                >
                                    <div className="w-6 h-6 rounded-full bg-brand-orange/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                                    </div>
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="order-1 lg:order-2 relative"
                    >
                        <div className="absolute inset-0 bg-brand-orange/20 rounded-3xl transform translate-x-4 translate-y-4 -z-10 blur-sm" />
                        <div className="relative h-[400px] sm:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#0A1C3B]">
                            <Image
                                src="/electrician_about_us.png"
                                alt="Nasz zespół w pracy"
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="absolute -bottom-6 -left-6 bg-white dark:bg-[#0A1C3B] p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand-navy dark:bg-brand-orange rounded-full flex items-center justify-center">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-brand-navy dark:text-white">100%</p>
                                    <p className="text-sm text-slate-500 font-medium tracking-wide">ZADOWOLENIA</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>

                {/* Stats / Numbers Section */}
                <div className="bg-brand-navy dark:bg-[#0A1C3B] rounded-3xl p-10 sm:p-16 text-white mb-20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-[80px] pointer-events-none" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center relative z-10">
                        {[
                            { number: "15+", label: "Lat Doświadczenia", icon: Zap },
                            { number: "500+", label: "Zrealizowanych Zleceń", icon: CheckCircle2 },
                            { number: "100%", label: "Skuteczności", icon: ShieldCheck },
                            { number: "24/7", label: "Pogotowie", icon: Award } // reusing Award icon here
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="flex flex-col items-center"
                            >
                                <stat.icon className="w-10 h-10 text-brand-orange mb-4 opacity-80" />
                                <span className="text-4xl sm:text-5xl font-extrabold mb-2">{stat.number}</span>
                                <span className="text-slate-300 font-medium uppercase tracking-wider text-sm">{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h3 className="text-2xl sm:text-3xl font-bold text-brand-navy dark:text-white mb-6">
                        Masz pytania, z którymi nie potrafisz sobie poradzić?
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/kontakt">
                            <button className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-brand-orange/50 active:scale-95 text-lg flex items-center justify-center gap-2">
                                Skontaktuj się z nami
                            </button>
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
