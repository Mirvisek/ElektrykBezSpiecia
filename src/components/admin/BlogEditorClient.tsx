"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Image as ImageIcon, Eye, Code, Zap, Globe, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BlogEditorProps {
    initialData?: {
        id?: string;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        imageUrl: string | null;
        isPublished: boolean;
    };
}

export default function BlogEditorClient({ initialData }: BlogEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    const [post, setPost] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        content: initialData?.content || "",
        excerpt: initialData?.excerpt || "",
        imageUrl: initialData?.imageUrl || null,
        isPublished: initialData?.isPublished ?? false,
    });

    // Auto-slug generation
    useEffect(() => {
        if (!initialData?.id && post.title) {
            const generatedSlug = post.title
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-')
                .trim();
            setPost(prev => ({ ...prev, slug: generatedSlug }));
        }
    }, [post.title, initialData?.id]);

    const handleSave = async () => {
        if (!post.title || !post.slug || !post.content) {
            alert("Tytuł, slug i treść są wymagane!");
            return;
        }

        setLoading(true);
        try {
            const url = initialData?.id ? `/api/blog/${initialData.id}` : "/api/blog";
            const method = initialData?.id ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(post),
            });

            if (res.ok) {
                alert(initialData?.id ? "Wpis zaktualizowany!" : "Wpis utworzony!");
                router.push("/adminpanel/blog");
                router.refresh();
            } else {
                const err = await res.json();
                alert(`Błąd: ${err.error || "Nieznany błąd"}`);
            }
        } catch (error) {
            alert("Błąd połączenia z serwerem.");
        }
        setLoading(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setPost({ ...post, imageUrl: data.url });
            }
        } catch (err) {
            alert("Błąd uploadu.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] p-4 sm:p-8 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/adminpanel/blog" className="p-2 bg-white dark:bg-[#0A1C3B] rounded-full shadow-sm hover:scale-110 transition-transform border border-slate-200 dark:border-slate-800">
                            <ArrowLeft className="w-5 h-5 text-brand-orange" />
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold dark:text-white">
                                {initialData?.id ? "Edytuj Artykuł" : "Nowy Artykuł"}
                            </h1>
                            <p className="text-slate-500 text-sm">Dodaj wartościową wiedzę dla swoich klientów</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold bg-white dark:bg-[#0A1C3B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                        >
                            {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {previewMode ? "Edytuj" : "Podgląd"}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold bg-brand-orange text-white flex items-center justify-center gap-2 hover:bg-brand-orange-dark shadow-lg shadow-brand-orange/20 transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? "Zapisywanie..." : "Zapisz artykuł"}
                        </button>
                    </div>
                </div>

                {!previewMode ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Editor */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tytuł artykułu</label>
                                <input
                                    value={post.title}
                                    onChange={(e) => setPost({ ...post, title: e.target.value })}
                                    placeholder="Np. Jak dbać o instalację elektryczną?"
                                    className="w-full text-xl font-bold px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#061125] border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange"
                                />
                            </div>

                            <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Treść (HTML / Tekst)</label>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Wspiera tagi HTML</span>
                                </div>
                                <textarea
                                    rows={20}
                                    value={post.content}
                                    onChange={(e) => setPost({ ...post, content: e.target.value })}
                                    placeholder="Tutaj wpisz treść artykułu..."
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#061125] border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange font-mono text-sm leading-relaxed"
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Publication */}
                            <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-brand-orange" /> Publikacja
                                </h3>
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Slug (URL)</label>
                                    <input
                                        value={post.slug}
                                        onChange={(e) => setPost({ ...post, slug: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#061125] border border-slate-200 dark:border-slate-700 dark:text-white text-sm outline-none"
                                    />
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mt-4">
                                        <input
                                            type="checkbox"
                                            checked={post.isPublished}
                                            onChange={(e) => setPost({ ...post, isPublished: e.target.checked })}
                                            className="w-5 h-5 accent-brand-orange"
                                        />
                                        <span className="font-bold text-sm dark:text-white">Opublikuj od razu</span>
                                    </label>
                                </div>
                            </div>

                            {/* Image */}
                            <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-brand-orange" /> Zdjęcie wyróżniające
                                </h3>
                                {post.imageUrl ? (
                                    <div className="relative group">
                                        <img src={post.imageUrl} className="w-full aspect-[16/9] object-cover rounded-xl mb-4" alt="" />
                                        <button
                                            onClick={() => setPost({ ...post, imageUrl: null })}
                                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-brand-orange/50 transition-colors mb-4">
                                        <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                                        <span className="text-xs text-slate-500 font-medium">Kliknij aby wgrać zdjęcie</span>
                                        <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                                    </label>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold dark:text-white mb-2 ml-1">Krótki opis</h3>
                                <p className="text-[10px] text-slate-400 mb-3 ml-1">Wyświetlany na liście artykułów (SEO)</p>
                                <textarea
                                    rows={4}
                                    value={post.excerpt}
                                    onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#061125] border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange text-sm"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Preview Mode */
                    <div className="bg-white dark:bg-[#0A1C3B] rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[70vh]">
                        {post.imageUrl && (
                            <img src={post.imageUrl} className="w-full aspect-[21/9] object-cover" alt="" />
                        )}
                        <div className="p-8 sm:p-12 max-w-3xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-brand-navy dark:text-white mb-6 leading-tight">
                                {post.title || "Tytuł artykułu"}
                            </h1>
                            {post.excerpt && (
                                <p className="text-xl text-slate-500 dark:text-slate-400 mb-8 border-l-4 border-brand-orange pl-5 italic">
                                    {post.excerpt}
                                </p>
                            )}
                            <div
                                className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-brand-navy dark:prose-headings:text-white prose-brand-orange"
                                dangerouslySetInnerHTML={{ __html: post.content || "<p>Brak treści...</p>" }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
