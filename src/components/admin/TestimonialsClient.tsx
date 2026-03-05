"use client";

import { useState } from "react";
import { Trash2, Star, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addTestimonial, deleteTestimonial } from "@/app/adminpanel/actions";

export default function TestimonialsClient({ initialData }: any) {
    const router = useRouter();
    const [testimonials, setTestimonials] = useState(initialData);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const f = e.target as any;
        const newDoc = {
            authorName: f.authorName.value,
            content: f.content.value,
            rating: parseInt(f.rating.value) || 5,
            order: testimonials.length + 1,
            isActive: true
        };
        await addTestimonial(newDoc);
        // Po udanym Server Action, odświeżamy widok by nałożyć na serwerze (albo mock na klienta po revalidacji)
        window.location.reload();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Na pewno usunąć tę opinię ze strony głównej?")) return;
        await deleteTestimonial(id);
        setTestimonials(testimonials.filter((t: any) => t.id !== id));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href="/adminpanel" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0A1C3B] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-brand-orange transition-all hover:shadow-md group">
                        <ArrowLeft className="w-5 h-5 text-brand-orange group-hover:-translate-x-1 transition-transform" />
                        Powrót do panelu
                    </Link>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <h2 className="text-3xl font-bold dark:text-white">Opinie Klientów</h2>
                </div>

                <div className="bg-white dark:bg-[#0A1C3B] p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold dark:text-white">Aktualne opinie na stronie</h3>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-orange/20 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Dodaj nową
                        </button>
                    </div>

                    {isAdding && (
                        <form onSubmit={handleAdd} className="bg-slate-50 dark:bg-[#0D1A30] p-6 rounded-xl border border-brand-orange/30 mb-8 shadow-inner">
                            <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4">Dodaj nową opinię manualnie:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Imię / Tytuł klienta</label>
                                    <input name="authorName" required className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" placeholder="np. Marek z Krakowa" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Ocena (1-5 gwiazdek)</label>
                                    <input name="rating" type="number" min="1" max="5" defaultValue="5" required className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Treść opinii</label>
                                <textarea name="content" required rows={3} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" placeholder="Pełen profesjonalizm i szybka naprawa..."></textarea>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2 text-slate-500 hover:text-slate-700 font-medium">Anuluj</button>
                                <button type="submit" disabled={loading} style={{ backgroundColor: "#10b981", color: "white" }} className="px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50 hover:opacity-80">Zapisz opinię</button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        {testimonials.length === 0 ? (
                            <p className="text-slate-500 py-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">Brak opinii widocznych na stronie.</p>
                        ) : (
                            testimonials.map((tmn: any) => (
                                <div key={tmn.id} className="flex flex-col sm:flex-row justify-between p-5 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-brand-orange/30 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-brand-navy dark:text-white text-lg">{tmn.authorName}</span>
                                            <div className="flex">
                                                {[...Array(tmn.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-brand-orange text-brand-orange" />)}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-400 italic text-sm">"{tmn.content}"</p>
                                    </div>
                                    <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center">
                                        <button onClick={() => handleDelete(tmn.id)} className="p-2 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
