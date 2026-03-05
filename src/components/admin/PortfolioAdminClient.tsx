"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, Upload, Eye, EyeOff, GripVertical, Image as ImageIcon } from "lucide-react";

const CATEGORIES = ["Instalacje elektryczne", "Pomiary elektryczne", "Montaż rozdzielnic", "Oświetlenie", "Usuwanie awarii", "Inteligentny dom", "Inne"];

interface PortfolioItem {
    id: string;
    title: string;
    description?: string | null;
    category?: string | null;
    imageUrl?: string | null;
    images: string[];
    order: number;
    isActive: boolean;
}

export default function PortfolioAdminClient({ initialItems }: { initialItems: PortfolioItem[] }) {
    const [items, setItems] = useState<PortfolioItem[]>(initialItems);
    const [editing, setEditing] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingFor, setUploadingFor] = useState<string | null>(null);

    const emptyForm = { title: "", description: "", category: CATEGORIES[0], imageUrl: "", images: [] as string[], order: 0, isActive: true };
    const [form, setForm] = useState(emptyForm);

    const resetForm = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };

    const startEdit = (item: PortfolioItem) => {
        setForm({
            title: item.title,
            description: item.description || "",
            category: item.category || CATEGORIES[0],
            imageUrl: item.imageUrl || "",
            images: item.images || [],
            order: item.order,
            isActive: item.isActive,
        });
        setEditing(item.id);
        setShowForm(true);
    };

    const handleUploadMain = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingFor("main");
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.success) setForm(f => ({ ...f, imageUrl: data.url }));
        setUploadingFor(null);
    };

    const handleUploadExtra = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploadingFor("extra");

        const uploaded: string[] = [];
        for (const file of files) {
            const fd = new FormData();
            fd.append("file", file);
            const res = await fetch("/api/upload", { method: "POST", body: fd });
            const data = await res.json();
            if (data.success) uploaded.push(data.url);
        }

        setForm(f => ({ ...f, images: [...f.images, ...uploaded] }));
        setUploadingFor(null);
    };

    const removeExtraImage = (idx: number) => {
        setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
    };

    const handleSave = async () => {
        if (!form.title.trim()) { alert("Tytuł jest wymagany."); return; }
        setLoading(true);

        if (editing) {
            const res = await fetch(`/api/portfolio/${editing}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setItems(prev => prev.map(i => i.id === editing ? { ...i, ...form } : i));
                resetForm();
            }
        } else {
            const res = await fetch("/api/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setItems(prev => [data.item, ...prev]);
                resetForm();
            }
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Usunąć realizację: "${title}"?`)) return;
        setLoading(true);
        await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
        setItems(prev => prev.filter(i => i.id !== id));
        setLoading(false);
    };

    const toggleActive = async (item: PortfolioItem) => {
        await fetch(`/api/portfolio/${item.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...item, isActive: !item.isActive }),
        });
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none text-sm";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] p-4 sm:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <Link href="/adminpanel" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0A1C3B] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-brand-orange transition-all hover:shadow-md group">
                        <ArrowLeft className="w-5 h-5 text-brand-orange group-hover:-translate-x-1 transition-transform" />
                        Powrót do panelu
                    </Link>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold dark:text-white">Realizacje</h1>
                        <p className="text-slate-500 text-sm">{items.length} pozycji · <Link href="/realizacje" target="_blank" className="text-brand-orange underline focus:outline-none">Podgląd strony →</Link></p>
                    </div>
                    <button onClick={() => { resetForm(); setShowForm(true); }}
                        className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-brand-orange/20">
                        <Plus className="w-5 h-5" /> Dodaj realizację
                    </button>
                </div>

                {/* FORMULARZ */}
                {showForm && (
                    <div className="bg-white dark:bg-[#0A1C3B] rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white">{editing ? "Edytuj realizację" : "Nowa realizacja"}</h2>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tytuł *</label>
                                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="np. Wymiana instalacji w mieszkaniu 60m²" className={inputCls} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kategoria</label>
                                <select value={form.category || ""} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Kolejność wyświetlania</label>
                                <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className={inputCls} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Opis</label>
                                <textarea value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={4} placeholder="Krótki opis wykonanych prac..." className={inputCls} />
                            </div>

                            {/* Główne zdjęcie */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Zdjęcie główne</label>
                                <div className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-brand-orange transition-colors group">
                                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-brand-orange" />
                                            <span className="text-sm text-slate-500">{uploadingFor === "main" ? "Wgrywanie..." : "Kliknij, aby wgrać zdjęcie"}</span>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleUploadMain} disabled={!!uploadingFor} />
                                        </label>
                                    </div>
                                    {form.imageUrl && (
                                        <div className="relative w-24 h-20 shrink-0">
                                            <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover rounded-xl" />
                                            <button onClick={() => setForm(f => ({ ...f, imageUrl: "" }))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Dodatkowe zdjęcia */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Dodatkowe zdjęcia <span className="text-slate-400 font-normal">(możesz wybrać wiele)</span>
                                </label>
                                <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-brand-orange transition-colors group mb-4">
                                    <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-brand-orange" />
                                    <span className="text-sm text-slate-500">{uploadingFor === "extra" ? "Wgrywanie..." : "Dodaj kolejne zdjęcia"}</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleUploadExtra} disabled={!!uploadingFor} />
                                </label>
                                {form.images.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                        {form.images.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square">
                                                <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                                                <button onClick={() => removeExtraImage(idx)}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} disabled={loading}
                                className="flex-1 py-4 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                <Save className="w-5 h-5" /> {loading ? "Zapisywanie..." : "Zapisz realizację"}
                            </button>
                            <button onClick={resetForm} className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Anuluj
                            </button>
                        </div>
                    </div>
                )}

                {/* LISTA */}
                <div className="space-y-4">
                    {items.length === 0 && !showForm && (
                        <div className="bg-white dark:bg-[#0A1C3B] rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-700">
                            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500">Brak realizacji. Kliknij „Dodaj realizację", aby dodać pierwszą.</p>
                        </div>
                    )}

                    {items.map(item => (
                        <div key={item.id} className={`bg-white dark:bg-[#0A1C3B] rounded-2xl border ${item.isActive ? "border-slate-200 dark:border-slate-700" : "border-dashed border-slate-300 dark:border-slate-600 opacity-60"} shadow-sm overflow-hidden`}>
                            <div className="flex gap-4 p-4">
                                {/* Miniatura */}
                                <div className="w-24 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-8 h-8 text-slate-300" />
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            {item.category && (
                                                <span className="text-xs bg-brand-orange/10 text-brand-orange font-bold px-2 py-0.5 rounded-full inline-block mb-1">{item.category}</span>
                                            )}
                                            <h3 className="font-bold dark:text-white text-sm leading-snug">{item.title}</h3>
                                            {item.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>}
                                            <p className="text-xs text-slate-400 mt-1">{item.images.length + (item.imageUrl ? 1 : 0)} zdjęcia</p>
                                        </div>

                                        {/* Akcje */}
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => toggleActive(item)} title={item.isActive ? "Ukryj" : "Pokaż"}
                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500">
                                                {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => startEdit(item)} title="Edytuj"
                                                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-blue-600">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(item.id, item.title)} title="Usuń"
                                                className="p-2 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 transition-colors text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
