"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, Check, X, BookOpen } from "lucide-react";
import { addDictionaryTerm, updateDictionaryTerm, deleteDictionaryTerm } from "@/app/adminpanel/actions";
import toast from "react-hot-toast";

export default function DictionaryClient({ initialTerms }: { initialTerms: any[] }) {
    const [terms, setTerms] = useState(initialTerms);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ term: "", explanation: "", order: 0, isActive: true });

    const handleAdd = async () => {
        if (!formData.term || !formData.explanation) {
            toast.error("Wypełnij wszystkie pola");
            return;
        }
        try {
            await addDictionaryTerm(formData);
            toast.success("Dodano pojęcie!");
            setIsAdding(false);
            setFormData({ term: "", explanation: "", order: 0, isActive: true });
            window.location.reload();
        } catch (err) {
            toast.error("Wystąpił błąd podczas dodawania.");
        }
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        try {
            await updateDictionaryTerm(editingId, formData);
            toast.success("Zapisano zmiany!");
            setEditingId(null);
            window.location.reload();
        } catch (err) {
            toast.error("Wystąpił błąd podczas aktualizacji.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Na pewno chcesz usunąć to pojęcie?")) {
            try {
                await deleteDictionaryTerm(id);
                toast.success("Usunięto pojęcie");
                window.location.reload();
            } catch (err) {
                toast.error("Wystąpił błąd podczas usuwania.");
            }
        }
    };

    const startEditing = (term: any) => {
        setFormData({ term: term.term, explanation: term.explanation, order: term.order, isActive: term.isActive });
        setEditingId(term.id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-brand-orange" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Słowniczek Elektryczny</h2>
                        <p className="text-sm text-slate-500">Zarządzaj pojęciami wyświetlanymi na stronie.</p>
                    </div>
                </div>
                {!isAdding && !editingId && (
                    <button
                        onClick={() => { setIsAdding(true); setFormData({ term: "", explanation: "", order: terms.length, isActive: true }); }}
                        className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 rounded-xl transition-colors font-semibold"
                    >
                        <Plus className="w-4 h-4" /> Dodaj Pojęcie
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                        {editingId ? "Edytuj pojęcie" : "Nowe pojęcie"}
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pojęcie</label>
                            <input
                                type="text"
                                value={formData.term}
                                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                                placeholder="np. Wyłącznik różnicowoprądowy (RCD)"
                                className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Wyjaśnienie</label>
                            <textarea
                                value={formData.explanation}
                                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                                placeholder="Proste wytłumaczenie w języku laika..."
                                rows={4}
                                className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kolejność</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="w-24 px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                                />
                            </div>
                            <div className="flex items-center mt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 accent-brand-orange"
                                    />
                                    <span className="text-sm font-medium dark:text-white">Aktywne</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => { setIsAdding(false); setEditingId(null); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-4 h-4" /> Anuluj
                            </button>
                            <button
                                onClick={editingId ? handleUpdate : handleAdd}
                                className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-xl hover:bg-brand-orange-dark transition-colors font-bold"
                            >
                                <Check className="w-4 h-4" /> Zapisz
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-[#0A1C3B] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Pojęcie</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:table-cell">Wyjaśnienie</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-slate-400 text-right">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {terms.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                    Brak pojęć. Kliknij "Dodaj Pojęcie" aby utworzyć pierwsze.
                                </td>
                            </tr>
                        ) : terms.map((term) => (
                            <tr key={term.id} className="hover:bg-slate-50 dark:hover:bg-[#0d2247] transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                                    {term.term}
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm hidden sm:table-cell max-w-md truncate">
                                    {term.explanation}
                                </td>
                                <td className="px-6 py-4">
                                    {term.isActive ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-xs font-bold rounded-md">
                                            Aktywne
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 text-xs font-bold rounded-md">
                                            Ukryte
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => startEditing(term)}
                                            className="p-2 text-slate-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-colors"
                                            title="Edytuj"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(term.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Usuń"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
