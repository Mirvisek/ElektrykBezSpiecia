"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Calendar, Layout, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
    imageUrl: string | null;
}

export default function BlogAdminClient({ initialPosts }: { initialPosts: BlogPost[] }) {
    const [posts, setPosts] = useState(initialPosts);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const togglePublish = async (post: BlogPost) => {
        const res = await fetch(`/api/blog/${post.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isPublished: !post.isPublished }),
        });
        if (res.ok) {
            setPosts(posts.map(p => p.id === post.id ? { ...p, isPublished: !p.isPublished } : p));
        }
    };

    const deletePost = async (post: BlogPost) => {
        if (!confirm(`Na pewno chcesz usunąć wpis: "${post.title}"?`)) return;
        const res = await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
        if (res.ok) {
            setPosts(posts.filter(p => p.id !== post.id));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link href="/adminpanel" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0A1C3B] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-brand-orange transition-all hover:shadow-md group">
                        <ArrowLeft className="w-5 h-5 text-brand-orange group-hover:-translate-x-1 transition-transform" />
                        Powrót do panelu
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <h1 className="text-3xl font-extrabold dark:text-white">Zarządzanie Blogiem</h1>
                    <Link href="/adminpanel/blog/nowy">
                        <button className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-orange/20">
                            <Plus className="w-5 h-5" /> Nowy Artykuł
                        </button>
                    </Link>
                </div>

                <div className="bg-white dark:bg-[#0A1C3B] rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Szukaj artykułu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#061125] border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-brand-orange"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left bg-slate-50 dark:bg-slate-900/50">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Artykuł</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Akcje</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {post.imageUrl ? (
                                                    <img src={post.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                        <Layout className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold dark:text-white line-clamp-1">{post.title}</div>
                                                    <div className="text-xs text-slate-400">/{post.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(post.createdAt).toLocaleDateString("pl-PL")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => togglePublish(post)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${post.isPublished
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {post.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                {post.isPublished ? "Opublikowany" : "Szkic"}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/adminpanel/blog/edycja/${post.id}`}>
                                                    <button className="p-2 text-slate-400 hover:text-brand-orange transition-colors">
                                                        <Edit2 className="w-5 h-5" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => deletePost(post)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
