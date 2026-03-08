"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

interface DictionaryTerm {
    id: string;
    term: string;
    explanation: string;
}

export default function SlowniczekClient({ terms }: { terms: DictionaryTerm[] }) {
    return (
        <div className="bg-slate-50 dark:bg-[#061125] min-h-screen pt-24 sm:pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-brand-orange/10 rounded-full mb-6 relative"
                    >
                        <BookOpen className="w-10 h-10 text-brand-orange relative z-10" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl font-extrabold text-brand-navy dark:text-white tracking-tight mb-4"
                    >
                        Słowniczek
                        <span className="text-brand-orange"> Elektryczny</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 dark:text-slate-400"
                    >
                        Prąd nie musi być czarną magią. Wyjaśniamy trudne nazwy w prosty sposób.
                    </motion.p>
                </div>

                {terms.length === 0 ? (
                    <div className="text-center text-slate-500 py-10 dark:text-slate-400">
                        Słowniczek jest obecnie w trakcie przygotowywania.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {terms.map((term, i) => (
                            <motion.div
                                key={term.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-[#0A1C3B] p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
                            >
                                <h3 className="text-xl sm:text-2xl font-bold text-brand-navy dark:text-white mb-3">
                                    {term.term}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                                    {term.explanation}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
