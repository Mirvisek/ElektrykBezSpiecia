"use client";

import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Trash2, CheckCircle, Mail, PhoneCall, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MessagesClient({ initialMessages }: any) {
    const [messages, setMessages] = useState(initialMessages);

    const updateStatus = async (id: string, newStatus: string) => {
        const res = await fetch(`/api/contact/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            setMessages((prev: any) => prev.map((m: any) => m.id === id ? { ...m, status: newStatus } : m));
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm("Czy na pewno chcesz usunąć to zgłoszenie? Tego nie da się cofnąć!")) return;
        const res = await fetch(`/api/contact/${id}`, { method: "DELETE" });
        if (res.ok) {
            setMessages((prev: any) => prev.filter((m: any) => m.id !== id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] p-4 sm:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <Link href="/adminpanel" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0A1C3B] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-brand-orange transition-all hover:shadow-md group">
                        <ArrowLeft className="w-5 h-5 text-brand-orange group-hover:-translate-x-1 transition-transform" />
                        Powrót do panelu
                    </Link>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold dark:text-white">Skrzynka Odbiorcza</h2>
                </div>

                <div className="space-y-6">
                    {messages.length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-[#0A1C3B] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                            <p className="text-slate-500">Super! Nie ma na razie żadnych nowych zgłoszeń.</p>
                        </div>
                    ) : (
                        messages.map((msg: any) => (
                            <div key={msg.id} className={`p-6 rounded-2xl shadow-sm border transition-colors ${msg.status === "NEW" ? "bg-white dark:bg-[#0A1C3B] border-brand-orange/50 shadow-[0_4px_15px_rgba(245,142,11,0.1)]" : "bg-slate-100 dark:bg-[#0D1A30] border-slate-200 dark:border-slate-800 opacity-70"}`}>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            {msg.status === "NEW" ? <AlertTriangle className="w-5 h-5 text-brand-orange" /> : <CheckCircle className="w-5 h-5 text-[#10b981]" />}
                                            <h3 className="text-xl font-bold dark:text-white">{msg.name}</h3>
                                            {msg.status === "NEW" && <span className="bg-brand-orange/20 text-brand-orange text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Nowe</span>}
                                        </div>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            {format(new Date(msg.createdAt), "dd MMMM yyyy, HH:mm", { locale: pl })}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {msg.status === "NEW" ? (
                                            <button onClick={() => updateStatus(msg.id, "DONE")} style={{ backgroundColor: "#10b981", color: "white" }} className="px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 hover:opacity-80">
                                                <CheckCircle className="w-4 h-4" /> Gotowe
                                            </button>
                                        ) : (
                                            <button onClick={() => updateStatus(msg.id, "NEW")} className="px-4 py-2 bg-slate-300 dark:bg-slate-700 hover:bg-brand-orange text-slate-700 dark:text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" /> Cofnij status
                                            </button>
                                        )}
                                        <button onClick={() => deleteMessage(msg.id)} className="px-4 py-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <p className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                        <PhoneCall className="w-5 h-5 text-brand-orange" />
                                        <a href={`tel:${msg.phone}`} className="hover:text-brand-orange transition-colors">{msg.phone}</a>
                                    </p>
                                    {msg.email ? (
                                        <p className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <Mail className="w-5 h-5 text-brand-orange" />
                                            <a href={`mailto:${msg.email}`} className="hover:text-brand-orange transition-colors">{msg.email}</a>
                                        </p>
                                    ) : (
                                        <p className="flex items-center gap-3 text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                                            <Mail className="w-5 h-5 opacity-50" />
                                            Brak email
                                        </p>
                                    )}
                                </div>

                                <div className="bg-slate-50 dark:bg-[#061125] p-5 rounded-xl border border-slate-200 dark:border-slate-800/70">
                                    <p className="text-[15px] leading-relaxed dark:text-slate-300 whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
