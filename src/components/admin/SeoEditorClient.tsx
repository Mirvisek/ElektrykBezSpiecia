"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, LayoutTemplate, Settings, Zap, ShieldCheck, Wrench, AlertTriangle, MonitorPlay, Mail, Send, Users, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { updateSiteSettings, addHeroSlide, deleteHeroSlide, addAdvantage, deleteAdvantage, addService, deleteService } from "@/app/adminpanel/actions";
import toast from "react-hot-toast";

export default function SeoEditorClient({ initialSettings, initialHeroSlides, initialAdvantages, initialServices }: any) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Zapamiętywanie zakładek w URL
    const activeTab = searchParams.get("tab") || "settings";
    const activeAppearanceTab = searchParams.get("sub") || "general";
    const activeSeoTab = searchParams.get("seo") || "seoSettings";
    const activeMailTab = searchParams.get("mail") || "config";

    const setTab = (tab: string, sub?: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        if (sub) params.set("sub", sub);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const setSubTab = (key: string, val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, val);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const [loading, setLoading] = useState(false);
    const [showSmtpPass, setShowSmtpPass] = useState(false);
    const [showResendKey, setShowResendKey] = useState(false);
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [newsletterSubject, setNewsletterSubject] = useState("");
    const [newsletterHtml, setNewsletterHtml] = useState("");
    const [sendingNewsletter, setSendingNewsletter] = useState(false);
    const [showTestInput, setShowTestInput] = useState(false);
    const [testEmail, setTestEmail] = useState("");

    useEffect(() => {
        if (activeTab === "mailing" && activeMailTab === "newsletter") {
            fetch("/api/newsletter").then(r => r.json()).then(setSubscribers).catch(() => { });
        }
    }, [activeTab, activeMailTab]);

    const [settings, setSettings] = useState(initialSettings || {});
    const [heroSlides, setHeroSlides] = useState(initialHeroSlides || []);
    const [advantages, setAdvantages] = useState(initialAdvantages || []);
    const [services, setServices] = useState(initialServices || []);

    // SYNCHRONIZACJA: Gwarantuje, że dane z serwera po router.refresh() trafią do formularzy
    useEffect(() => { setSettings(initialSettings || {}); }, [initialSettings]);
    useEffect(() => { setHeroSlides(initialHeroSlides || []); }, [initialHeroSlides]);
    useEffect(() => { setAdvantages(initialAdvantages || []); }, [initialAdvantages]);
    useEffect(() => { setServices(initialServices || []); }, [initialServices]);

    const handleSaveSettings = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateSiteSettings(settings);
            toast.success("Ustawienia główne zostały zapisane!");
            router.refresh();
        } catch (err) {
            toast.error("Wystąpił błąd podczas zapisywania.");
        }
        setLoading(false);
    };

    const handleAddSectionObj = async (setter: any, addAction: any, data: any, typeName: string) => {
        setLoading(true);
        try {
            await addAction(data);
            toast.success(`Dodano: ${typeName}`);
            router.refresh();
        } catch (err) {
            toast.error("Nie udało się dodać elementu.");
        }
        setLoading(false);
    };

    const handleDeleteSectionObj = async (setter: any, deleteAction: any, id: string, name: string) => {
        if (!confirm(`Na pewno chcesz usunąć: ${name}?`)) return;

        // INSTANT UPDATE: Usuwamy lokalnie przed końcem akcji na serwerze
        setter((prev: any[]) => prev.filter(item => item.id !== id));

        setLoading(true);
        try {
            await deleteAction(id);
            toast.success("Usunięto pomyślnie.");
            router.refresh();
        } catch (err) {
            toast.error("Błąd podczas usuwania. Przywracanie...");
            router.refresh();
        }
        setLoading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const oldFileUrl = (settings as any)[fieldName];
        const formData = new FormData();
        formData.append('file', file);
        if (oldFileUrl) {
            formData.append('oldFileUrl', oldFileUrl);
        }

        setLoading(true);
        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.success) {
                setSettings({ ...settings, [fieldName]: data.url });
                toast.success("Plik wgrany pomyślnie.");
            } else {
                toast.error("Błąd podczas wgrywania pliku.");
            }
        } catch (err) {
            toast.error("Brak połączenia z serwerem.");
        }
        setLoading(false);
    };

    const handleFileDelete = async (fieldName: string) => {
        const fileUrl = (settings as any)[fieldName];
        if (!fileUrl) return;

        setLoading(true);
        try {
            await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrl })
            });
            setSettings({ ...settings, [fieldName]: "" });
            toast.success("Plik usunięty.");
        } catch (e) {
            toast.error("Błąd podczas usuwania pliku.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] p-4 sm:p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link href="/adminpanel" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0A1C3B] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-brand-orange transition-all hover:shadow-md group">
                        <ArrowLeft className="w-5 h-5 text-brand-orange group-hover:-translate-x-1 transition-transform" />
                        Powrót do panelu
                    </Link>
                </div>

                <div className="flex items-center gap-4 mb-10 sm:mb-14">
                    <h2 className="text-3xl sm:text-4xl font-extrabold dark:text-white tracking-tight">Edytor SEO i Strony Głównej</h2>
                </div>

                {/* TABS */}
                <div className="flex flex-wrap gap-3 mb-10 sm:mb-14 bg-white dark:bg-[#0A1C3B] p-3 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
                    <button onClick={() => setTab("settings")} className={`flex-1 min-w-[150px] py-4 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "settings" ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                        <Settings className="w-5 h-5" /> Główne inf.
                    </button>
                    <button onClick={() => setTab("appearance")} className={`flex-1 min-w-[150px] py-4 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "appearance" ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                        <LayoutTemplate className="w-5 h-5" /> Wygląd i Karuzele
                    </button>
                    <button onClick={() => setTab("seo")} className={`flex-1 min-w-[150px] py-4 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "seo" ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                        <MonitorPlay className="w-5 h-5" /> Meta / SEO
                    </button>
                    <button onClick={() => setTab("mailing")} className={`flex-1 min-w-[150px] py-4 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "mailing" ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                        <Mail className="w-5 h-5" /> Mailing
                    </button>
                </div>

                <div className="bg-white dark:bg-[#0A1C3B] p-8 sm:p-12 rounded-3xl shadow-md border border-slate-200 dark:border-slate-800">
                    {/* --- TAB: SETTINGS --- */}
                    {activeTab === "settings" && (
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            <h3 className="text-xl font-bold dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Główne informacje wizytówki</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Telefon kontaktowy</label>
                                    <input value={settings.contactPhone || ""} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email kontaktowy</label>
                                    <input value={settings.contactMail || ""} onChange={(e) => setSettings({ ...settings, contactMail: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adres firmy</label>
                                    <input value={settings.address || ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nazwa firmy (B2B)</label>
                                    <input value={settings.companyName || ""} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">NIP firmy</label>
                                    <input value={settings.companyNip || ""} onChange={(e) => setSettings({ ...settings, companyNip: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Numer telefonu WhatsApp (opcja)</label>
                                    <input value={settings.whatsappNumber || ""} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Link do profilu Facebook (opcja)</label>
                                    <input value={settings.facebookUrl || ""} onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Link do profilu Instagram (opcja)</label>
                                    <input value={settings.instagramUrl || ""} onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Godziny otwarcia</label>
                                    <textarea rows={3} placeholder="Np. Poniedziałek - Piątek: 8:00 - 18:00\nSobota: Na wezwanie" value={settings.workingHours || ""} onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none whitespace-pre-line"></textarea>
                                </div>

                                <div className="md:col-span-2 bg-slate-50 dark:bg-[#061125] p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                        <LayoutTemplate className="w-4 h-4 text-brand-orange" />
                                        Widoczność sekcji w menu
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label className="flex items-center justify-between p-4 bg-white dark:bg-[#0A1C3B] rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-brand-orange transition-colors">
                                            <span className="font-bold text-sm dark:text-white">Sekcja Realizacje</span>
                                            <input type="checkbox" checked={settings.portfolioActive ?? true} onChange={(e) => setSettings({ ...settings, portfolioActive: e.target.checked })} className="w-5 h-5 accent-brand-orange cursor-pointer" />
                                        </label>
                                        <label className="flex items-center justify-between p-4 bg-white dark:bg-[#0A1C3B] rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-brand-orange transition-colors">
                                            <span className="font-bold text-sm dark:text-white">Sekcja Blog</span>
                                            <input type="checkbox" checked={settings.blogActive ?? true} onChange={(e) => setSettings({ ...settings, blogActive: e.target.checked })} className="w-5 h-5 accent-brand-orange cursor-pointer" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="mt-8 px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 hover:opacity-80">
                                <Save className="w-6 h-6" /> {loading ? "Zapisywanie w tle..." : "Zapisz informacje"}
                            </button>
                        </form>
                    )}

                    {/* --- TAB: APPEARANCE --- */}
                    {activeTab === "appearance" && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-[#0D1A30] p-2 rounded-xl border border-slate-200 dark:border-slate-800 mb-8 sm:mb-12">
                                <button type="button" onClick={() => setSubTab("sub", "general")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "general" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Logotyp i stopka</button>
                                <button type="button" onClick={() => setSubTab("sub", "topBanner")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "topBanner" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Pasek Ogłoszeń</button>
                                <button type="button" onClick={() => setSubTab("sub", "hero")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "hero" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Karuzela</button>
                                <button type="button" onClick={() => setSubTab("sub", "advantages")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "advantages" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Dlaczego My</button>
                                <button type="button" onClick={() => setSubTab("sub", "services")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "services" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Usługi</button>
                            </div>

                            {activeAppearanceTab === "topBanner" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Górny pasek powiadomień</h3>
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#061125] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <input type="checkbox" checked={settings.topBannerActive || false} onChange={(e) => setSettings({ ...settings, topBannerActive: e.target.checked })} className="w-6 h-6 text-brand-orange focus:ring-brand-orange rounded cursor-pointer" id="toggleBanner" />
                                        <label htmlFor="toggleBanner" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">Włącz wyświetlanie paska ogłoszeń</label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Treść ogłoszenia</label>
                                        <input value={settings.topBannerText || ""} onChange={(e) => setSettings({ ...settings, topBannerText: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                    </div>
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="mt-8 px-8 py-3 rounded-xl text-lg font-bold hover:opacity-80 transition-all flex items-center justify-center gap-3">
                                        <Save className="w-6 h-6" /> {loading ? "Zapisywanie..." : "Zapisz pasek"}
                                    </button>
                                </form>
                            )}

                            {activeAppearanceTab === "general" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Logotyp i stopka</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tekst stopki</label>
                                            <input value={settings.footerText || ""} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Logo</label>
                                            {settings.logoUrl ? (
                                                <div className="border rounded-xl p-4 bg-slate-50 dark:bg-[#061125]">
                                                    <img src={settings.logoUrl} alt="Logo" className="max-h-24 mx-auto mb-4" />
                                                    <button type="button" onClick={() => handleFileDelete('logoUrl')} className="w-full text-red-500 font-bold py-2 bg-red-50 dark:bg-red-900/10 rounded-lg"><Trash2 className="w-4 h-4 inline mr-2" /> Usuń Logo</button>
                                                </div>
                                            ) : (
                                                <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
                                                    <Plus className="text-slate-400 mb-2" />
                                                    <span className="text-sm font-bold text-slate-500">Wgraj Logo</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="mt-8 px-8 py-3 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-3">
                                        <Save className="w-6 h-6" /> Zapisz
                                    </button>
                                </form>
                            )}

                            {activeAppearanceTab === "hero" && (
                                <div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault(); const f = e.target as any;
                                        handleAddSectionObj(setHeroSlides, addHeroSlide, { title: f.title.value, subtitle: f.subtitle.value, buttonText: f.btnText.value, buttonLink: f.btnLink.value, order: heroSlides.length + 1, isActive: true }, "Slajd");
                                        f.reset();
                                    }} className="bg-slate-50 dark:bg-[#0D1A30] p-6 rounded-xl border border-brand-orange/30 mb-8">
                                        <h4 className="font-bold dark:text-white mb-4">Dodaj nowy slajd</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input name="title" required placeholder="Tytuł" className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] dark:text-white border outline-none" />
                                            <input name="subtitle" required placeholder="Podtytuł" className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] dark:text-white border outline-none" />
                                            <input name="btnText" placeholder="Tekst przycisku" className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] dark:text-white border outline-none" />
                                            <input name="btnLink" placeholder="Link przycisku" className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] dark:text-white border outline-none" />
                                        </div>
                                        <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-orange text-white rounded-xl font-bold">{loading ? "Dodawanie..." : "Dodaj Slajd"}</button>
                                    </form>
                                    <div className="space-y-4">
                                        {heroSlides.map((slide: any) => (
                                            <div key={slide.id} className="p-4 border rounded-xl flex justify-between items-center bg-slate-50 dark:bg-[#061125]">
                                                <div className="dark:text-white font-bold">{slide.title}</div>
                                                <button onClick={() => handleDeleteSectionObj(setHeroSlides, deleteHeroSlide, slide.id, slide.title)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeAppearanceTab === "advantages" && (
                                <div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault(); const f = e.target as any;
                                        handleAddSectionObj(setAdvantages, addAdvantage, { title: f.title.value, description: f.desc.value, icon: f.icon.value, order: advantages.length + 1, isActive: true }, "Zaletę");
                                        f.reset();
                                    }} className="bg-slate-50 dark:bg-[#0D1A30] p-6 rounded-xl border border-brand-orange/30 mb-8">
                                        <h4 className="font-bold dark:text-white mb-4">Dodaj zaletę</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input name="title" required placeholder="Tytuł" className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] border outline-none dark:text-white" />
                                            <select name="icon" className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] border outline-none dark:text-white text-slate-700">
                                                <option value="Zap">Błyskawica</option>
                                                <option value="ShieldCheck">Tarcza</option>
                                                <option value="Wrench">Klucz</option>
                                                <option value="AlertTriangle">Trójkąt</option>
                                            </select>
                                            <textarea name="desc" required placeholder="Opis" className="md:col-span-2 w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] border outline-none dark:text-white"></textarea>
                                        </div>
                                        <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-orange text-white rounded-xl font-bold">Zapisz</button>
                                    </form>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {advantages.map((adv: any) => (
                                            <div key={adv.id} className="p-4 border rounded-xl bg-slate-50 dark:bg-[#061125] relative">
                                                <button onClick={() => handleDeleteSectionObj(setAdvantages, deleteAdvantage, adv.id, adv.title)} className="absolute top-2 right-2 p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                                                <div className="font-bold dark:text-white mt-4">{adv.title}</div>
                                                <div className="text-sm text-slate-500 mt-2">{adv.description}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeAppearanceTab === "services" && (
                                <div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault(); const f = e.target as any;
                                        handleAddSectionObj(setServices, addService, { title: f.title.value, description: f.desc.value, icon: f.icon.value, order: services.length + 1, isActive: true }, "Usługę");
                                        f.reset();
                                    }} className="bg-slate-50 dark:bg-[#0D1A30] p-6 rounded-xl border border-brand-orange/30 mb-8">
                                        <h4 className="font-bold dark:text-white mb-4">Dodaj usługę</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input name="title" required placeholder="Nazwa usługi" className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] border outline-none dark:text-white" />
                                            <select name="icon" className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] border outline-none dark:text-white text-slate-700">
                                                <option value="Zap">Piorun</option>
                                                <option value="Activity">Puls (Pomiary)</option>
                                                <option value="Home">Dom</option>
                                                <option value="Cpu">Smart Home</option>
                                            </select>
                                            <textarea name="desc" required placeholder="Krótki opis" className="md:col-span-2 w-full px-4 py-2 rounded-xl bg-white dark:bg-[#061125] border outline-none dark:text-white"></textarea>
                                        </div>
                                        <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-orange text-white rounded-xl font-bold">Dodaj Usługę</button>
                                    </form>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {services.map((srv: any) => (
                                            <div key={srv.id} className="p-4 border rounded-xl bg-slate-50 dark:bg-[#061125] flex justify-between items-center group">
                                                <div>
                                                    <div className="font-bold dark:text-white">{srv.title}</div>
                                                    <div className="text-xs text-slate-500">{srv.description}</div>
                                                </div>
                                                <button onClick={() => handleDeleteSectionObj(setServices, deleteService, srv.id, srv.title)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* --- TAB: SEO --- */}
                    {activeTab === "seo" && (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-[#0D1A30] p-2 rounded-xl border border-slate-200 dark:border-slate-800 mb-8 sm:mb-12">
                                <button type="button" onClick={() => setSubTab("seo", "seoSettings")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeSeoTab === "seoSettings" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Ustawienia SEO</button>
                                <button type="button" onClick={() => setSubTab("seo", "openGraph")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeSeoTab === "openGraph" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Social Media</button>
                                <button type="button" onClick={() => setSubTab("seo", "integrations")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeSeoTab === "integrations" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Integracje</button>
                            </div>

                            {activeSeoTab === "seoSettings" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white mb-4">Meta Title / Description</h3>
                                    <div>
                                        <label className="block text-sm font-bold dark:text-white mb-2">Tytuł strony</label>
                                        <input value={settings.title || ""} onChange={(e) => setSettings({ ...settings, title: e.target.value })} className="w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-[#061125] dark:text-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold dark:text-white mb-2">Opis SEO</label>
                                        <textarea rows={3} value={settings.description || ""} onChange={(e) => setSettings({ ...settings, description: e.target.value })} className="w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-[#061125] dark:text-white outline-none"></textarea>
                                    </div>
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="px-8 py-3 rounded-xl font-bold">Zapisz SEO</button>
                                </form>
                            )}
                            {activeSeoTab === "openGraph" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white mb-4">Udostępnianie linków (OG)</h3>
                                    <div>
                                        <label className="block text-sm font-bold dark:text-white mb-2">Tytuł OG</label>
                                        <input value={settings.ogTitle || ""} onChange={(e) => setSettings({ ...settings, ogTitle: e.target.value })} className="w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-[#061125] dark:text-white outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold dark:text-white mb-2">Obrazek OG</label>
                                        {settings.ogImageUrl ? (
                                            <div className="border rounded-xl p-4">
                                                <img src={settings.ogImageUrl} alt="OG" className="max-h-32 mb-4 rounded" />
                                                <button type="button" onClick={() => handleFileDelete('ogImageUrl')} className="text-red-500 font-bold">Usuń</button>
                                            </div>
                                        ) : (
                                            <input type="file" onChange={(e) => handleFileUpload(e, 'ogImageUrl')} className="dark:text-white" />
                                        )}
                                    </div>
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="px-8 py-3 rounded-xl font-bold">Zapisz OG</button>
                                </form>
                            )}
                            {activeSeoTab === "integrations" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold dark:text-white mb-2">Google Analytics ID</label>
                                        <input value={settings.googleAnalyticsId || ""} onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })} className="w-full px-4 py-3 border rounded-xl bg-slate-50 dark:bg-[#061125] dark:text-white outline-none" />
                                    </div>
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="px-8 py-3 rounded-xl font-bold">Zapisz Integracje</button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* --- TAB: MAILING --- */}
                    {activeTab === "mailing" && (
                        <div>
                            <div className="flex gap-2 mb-8">
                                <button onClick={() => setSubTab("mail", "config")} className={`px-4 py-2 font-bold rounded-xl ${activeMailTab === "config" ? "bg-brand-orange text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>Parametry</button>
                                <button onClick={() => setSubTab("mail", "newsletter")} className={`px-4 py-2 font-bold rounded-xl ${activeMailTab === "newsletter" ? "bg-brand-orange text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>Newsletter</button>
                            </div>
                            {activeMailTab === "config" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold dark:text-white mb-2">Metoda</label>
                                        <select value={settings.emailProvider || "smtp"} onChange={e => setSettings({ ...settings, emailProvider: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#061125] dark:text-white">
                                            <option value="smtp">SMTP (Poczta tradycyjna)</option>
                                            <option value="resend">Resend (Zalecane API)</option>
                                        </select>
                                    </div>
                                    {settings.emailProvider === "resend" ? (
                                        <div>
                                            <label className="block text-sm font-bold dark:text-white mb-2">Resend API Key</label>
                                            <input type="password" value={settings.resendApiKey || ""} onChange={e => setSettings({ ...settings, resendApiKey: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#061125] dark:text-white" />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <input placeholder="Host" value={settings.smtpHost || ""} onChange={e => setSettings({ ...settings, smtpHost: e.target.value })} className="p-2 border rounded dark:bg-[#061125] dark:text-white" />
                                            <input placeholder="Port" value={settings.smtpPort || ""} onChange={e => setSettings({ ...settings, smtpPort: e.target.value })} className="p-2 border rounded dark:bg-[#061125] dark:text-white" />
                                            <input placeholder="Login" value={settings.smtpUser || ""} onChange={e => setSettings({ ...settings, smtpUser: e.target.value })} className="p-2 border rounded dark:bg-[#061125] dark:text-white" />
                                            <input placeholder="Hasło" type="password" value={settings.smtpPass || ""} onChange={e => setSettings({ ...settings, smtpPass: e.target.value })} className="p-2 border rounded dark:bg-[#061125] dark:text-white" />
                                        </div>
                                    )}
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="px-8 py-3 rounded-xl font-bold">Zapisz Mailing</button>
                                </form>
                            )}
                            {activeMailTab === "newsletter" && (
                                <div className="space-y-4">
                                    <h4 className="font-bold dark:text-white">Subskrybenci ({subscribers.length})</h4>
                                    <div className="bg-slate-50 dark:bg-[#061125] rounded-xl p-4 border dark:text-white">
                                        {subscribers.map((s: any) => <div key={s.id} className="border-b py-2 text-sm">{s.email}</div>)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
