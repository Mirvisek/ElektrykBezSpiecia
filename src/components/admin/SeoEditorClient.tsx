"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, LayoutTemplate, Settings, Zap, ShieldCheck, Wrench, AlertTriangle, MonitorPlay, Mail, Send, Users, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateSiteSettings, addHeroSlide, deleteHeroSlide, addAdvantage, deleteAdvantage, addService, deleteService } from "@/app/adminpanel/actions";

export default function SeoEditorClient({ initialSettings, initialHeroSlides, initialAdvantages, initialServices }: any) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("settings");
    const [activeAppearanceTab, setActiveAppearanceTab] = useState("general");
    const [activeSeoTab, setActiveSeoTab] = useState("seoSettings");
    const [activeMailTab, setActiveMailTab] = useState("config");
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

    const handleSaveSettings = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        await updateSiteSettings(settings);
        setLoading(false);
        alert("Ustawienia globalne zapisane!");
        router.refresh();
    };

    const handleAddSectionObj = async (setter: any, addAction: any, data: any, typeName: string) => {
        setLoading(true);
        await addAction(data);
        alert(`Dodano do sekcji: ${typeName}`);
        setLoading(false);
        router.refresh();
        window.location.reload(); // Prosty sposób na pewny re-fetch po mutacji dla listy
    };

    const handleDeleteSectionObj = async (setter: any, deleteAction: any, id: string, name: string) => {
        if (!confirm(`Na pewno chcesz usunąć: ${name}?`)) return;
        setLoading(true);
        await deleteAction(id);
        setLoading(false);
        router.refresh();
        window.location.reload();
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
            } else {
                alert("Błąd podczas wgrywania pliku.");
            }
        } catch (err) {
            alert("Brak połączenia z serwerem.");
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
        } catch (e) {
            alert("Błąd podczas usuwania pliku.");
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
                    <button onClick={() => setActiveTab("settings")} className={`flex-1 min-w-[150px] py-4 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "settings" ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                        <Settings className="w-5 h-5" /> Główne inf.
                    </button>
                    <button onClick={() => setActiveTab("appearance")} className={`flex-1 min-w-[150px] py-4 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "appearance" ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                        <LayoutTemplate className="w-5 h-5" /> Wygląd i Karuzele
                    </button>
                    <button onClick={() => setActiveTab("seo")} className={`flex-1 min-w-[150px] py-4 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "seo" ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                        <MonitorPlay className="w-5 h-5" /> Meta / SEO
                    </button>
                    <button onClick={() => setActiveTab("mailing")} className={`flex-1 min-w-[150px] py-4 px-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${activeTab === "mailing" ? "bg-brand-orange text-white shadow-md shadow-brand-orange/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
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

                                {/* Linki nawigacji Active/Inactive */}
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
                            {/* SUBTABS DLA WYGLĄDU */}
                            <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-[#0D1A30] p-2 rounded-xl border border-slate-200 dark:border-slate-800 mb-8 sm:mb-12">
                                <button type="button" onClick={() => setActiveAppearanceTab("general")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "general" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Logotyp i stopka</button>
                                <button type="button" onClick={() => setActiveAppearanceTab("topBanner")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "topBanner" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Pasek Ogłoszeń</button>
                                <button type="button" onClick={() => setActiveAppearanceTab("hero")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "hero" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Karuzela</button>
                                <button type="button" onClick={() => setActiveAppearanceTab("advantages")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "advantages" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Dlaczego My</button>
                                <button type="button" onClick={() => setActiveAppearanceTab("services")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeAppearanceTab === "services" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Usługi</button>
                            </div>

                            {activeAppearanceTab === "topBanner" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Górny pasek powiadomień</h3>
                                    <p className="text-sm text-slate-500 mb-4">Pasek świetnie przykuwa uwagę i pojawia się zawsze na samej górze witryny. Używaj go do informowania o urlopie lub wyjątkowych promocjach.</p>
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#061125] p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={settings.topBannerActive || false}
                                            onChange={(e) => setSettings({ ...settings, topBannerActive: e.target.checked })}
                                            className="w-6 h-6 text-brand-orange focus:ring-brand-orange rounded cursor-pointer"
                                            id="toggleBanner"
                                        />
                                        <label htmlFor="toggleBanner" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                                            Włącz wyświetlanie dolnego/górnego paska ogłoszeń
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Treść ogłoszenia na pasku</label>
                                        <input placeholder="np. UWAGA: W dniach 12-15 sierpnia przebywam na urlopie!" value={settings.topBannerText || ""} onChange={(e) => setSettings({ ...settings, topBannerText: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                    </div>
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="mt-8 px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 hover:opacity-80">
                                        <Save className="w-6 h-6" /> {loading ? "Zapisywanie w tle..." : "Zapisz pasek ogłoszeń"}
                                    </button>
                                </form>
                            )}

                            {activeAppearanceTab === "general" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Logotyp strony i stopka</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tekst stopki (Copyright)</label>
                                            <input value={settings.footerText || ""} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Logo Strony (Obrazek)</label>
                                            {settings.logoUrl ? (
                                                <div className="relative inline-block border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-[#061125] w-full">
                                                    <img src={settings.logoUrl} alt="Logo" className="max-h-24 w-auto object-contain mb-4" />
                                                    <button type="button" onClick={() => handleFileDelete('logoUrl')} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg transition-all font-bold">
                                                        <Trash2 className="w-4 h-4" /> Usuń Obecne Zdjęcie
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#061125] transition-all group">
                                                    <Plus className="w-8 h-8 text-slate-400 group-hover:text-brand-orange mb-2" />
                                                    <span className="text-sm font-bold text-slate-500 group-hover:text-brand-orange transition-colors">Wybierz zdjęcie z dysku...</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                                                </label>
                                            )}
                                            <p className="text-xs text-slate-500 mt-2">Pliki zostaną automatycznie spakowane i zminifikowane na dysku serwera.</p>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ikona w małej karcie przeglądarki (Favicon obok Meta Title)</label>
                                        {settings.iconUrl ? (
                                            <div className="relative inline-block border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-[#061125] w-full md:w-1/2">
                                                <img src={settings.iconUrl} alt="Favicon" className="max-h-16 w-auto object-contain mb-4" />
                                                <button type="button" onClick={() => handleFileDelete('iconUrl')} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg transition-all font-bold">
                                                    <Trash2 className="w-4 h-4" /> Usuń Ikonę
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-full md:w-1/2 h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#061125] transition-all group">
                                                <Plus className="w-8 h-8 text-slate-400 group-hover:text-brand-orange mb-2" />
                                                <span className="text-sm font-bold text-slate-500 group-hover:text-brand-orange transition-colors">Wybierz ikonę (najlepiej kwadrat .png lub .ico)</span>
                                                <input type="file" className="hidden" accept="image/*,.ico" onChange={(e) => handleFileUpload(e, 'iconUrl')} />
                                            </label>
                                        )}
                                        <p className="text-xs text-slate-500 mt-2">Domyślna zalecana rozdzielczość na Favicon to proporcja kwadratowa (np. 64x64px lub 512x512px).</p>
                                    </div>
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="mt-8 px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 hover:opacity-80">
                                        <Save className="w-6 h-6" /> {loading ? "Zapisywanie w tle..." : "Zapisz stylizacje"}
                                    </button>
                                </form>
                            )}

                            {/* --- TAB: HERO SLIDES (wewnątrz WYGLĄDU) --- */}
                            {activeAppearanceTab === "hero" && (
                                <div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault(); const f = e.target as any;
                                        handleAddSectionObj(setHeroSlides, addHeroSlide, { title: f.title.value, subtitle: f.subtitle.value, buttonText: f.btnText.value, buttonLink: f.btnLink.value, order: heroSlides.length + 1, isActive: true }, "Karuzela Hero");
                                    }} className="bg-slate-50 dark:bg-[#0D1A30] p-6 rounded-xl border border-brand-orange/30 mb-8 shadow-inner">
                                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-brand-orange" /> Dodaj nowy kafel/slajd do rotacji na górze strony</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input name="title" required placeholder="Tytuł, np. Potrzebujesz nagłej pomocy elektryka?" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none" />
                                            <input name="subtitle" required placeholder="Podpis pod spodem" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none" />
                                            <input name="btnText" placeholder="Tekst przycisku, np. Zadzwoń po nas" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none" />
                                            <input name="btnLink" placeholder="Link, np. /kontakt" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none" />
                                        </div>
                                        <button type="submit" disabled={loading} style={{ padding: "10px 36px" }} className="bg-brand-orange hover:bg-brand-orange/80 text-white rounded-xl text-base font-bold transition-all flex items-center justify-center gap-3 whitespace-nowrap w-full sm:w-auto shadow-sm">
                                            <Save className="w-5 h-5" /> {loading ? "..." : "Zapisz slajd"}
                                        </button>
                                    </form>

                                    <div className="space-y-4">
                                        {heroSlides.map((slide: any) => (
                                            <div key={slide.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center bg-slate-50 dark:bg-[#061125]">
                                                <div>
                                                    <p className="font-bold dark:text-white text-lg">{slide.title}</p>
                                                    <p className="text-slate-500 text-sm">{slide.subtitle}</p>
                                                </div>
                                                <button onClick={() => handleDeleteSectionObj(setHeroSlides, deleteHeroSlide, slide.id, slide.title)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: ADVANTAGES (wewnątrz WYGLĄDU) --- */}
                            {activeAppearanceTab === "advantages" && (
                                <div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault(); const f = e.target as any;
                                        handleAddSectionObj(setAdvantages, addAdvantage, { title: f.title.value, description: f.desc.value, icon: f.icon.value, order: advantages.length + 1, isActive: true }, "Dlaczego My");
                                    }} className="bg-slate-50 dark:bg-[#0D1A30] p-6 rounded-xl border border-brand-orange/30 mb-8 shadow-inner">
                                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-brand-orange" /> Dodaj nowy argument (Kwadrat) do sekcji Dlaczego My</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input name="title" required placeholder="Tytuł, np. DOŚWIADCZENIE" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none" />
                                            <select name="icon" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none">
                                                <option value="Zap">Ikonka: Błyskawica (Zap)</option>
                                                <option value="ShieldCheck">Ikonka: Tarcza sukcesu</option>
                                                <option value="Wrench">Ikonka: Klucz</option>
                                                <option value="AlertTriangle">Ikonka: Awaria (Trójkąt)</option>
                                            </select>
                                            <textarea name="desc" required rows={2} placeholder="Krótki tekst argumentujący" className="md:col-span-2 w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none"></textarea>
                                        </div>
                                        <button type="submit" disabled={loading} style={{ padding: "10px 36px" }} className="bg-brand-orange hover:bg-brand-orange/80 text-white rounded-xl text-base font-bold transition-all flex items-center justify-center gap-3 whitespace-nowrap w-full sm:w-auto shadow-sm">
                                            <Save className="w-5 h-5" /> {loading ? "..." : "Zapisz blok"}
                                        </button>
                                    </form>

                                    <div className="space-y-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {advantages.map((adv: any) => (
                                            <div key={adv.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#061125] relative">
                                                <button onClick={() => handleDeleteSectionObj(setAdvantages, deleteAdvantage, adv.id, adv.title)} className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                <p className="font-bold dark:text-white mt-4">{adv.title}</p>
                                                <p className="text-slate-500 text-sm mt-2">{adv.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: SERVICES (wewnątrz WYGLĄDU) --- */}
                            {activeAppearanceTab === "services" && (
                                <div>
                                    <form onSubmit={(e) => {
                                        e.preventDefault(); const f = e.target as any;
                                        handleAddSectionObj(setServices, addService, { title: f.title.value, description: f.desc.value, icon: f.icon.value, order: services.length + 1, isActive: true }, "Usługi");
                                    }} className="bg-slate-50 dark:bg-[#0D1A30] p-6 rounded-xl border border-brand-orange/30 mb-8 shadow-inner">
                                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-brand-orange" /> Dodaj nową usługę rynkową wyświetlaną na stronie we frontendzie</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <input name="title" required placeholder="Nazwa usługi, np. Pomiary Instalacji" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none" />
                                            <select name="icon" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none">
                                                <option value="Activity">Ikonka: Puls (Pomiary)</option>
                                                <option value="Home">Ikonka: Dom</option>
                                                <option value="Zap">Ikonka: Piorun</option>
                                                <option value="Cpu">Ikonka: Procesor (Smart Home)</option>
                                            </select>
                                            <textarea name="desc" required rows={2} placeholder="Krótki tekst usługi..." className="md:col-span-2 w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none"></textarea>
                                        </div>
                                        <button type="submit" disabled={loading} style={{ padding: "10px 36px" }} className="bg-brand-orange hover:bg-brand-orange/80 text-white rounded-xl text-base font-bold transition-all flex items-center justify-center gap-3 whitespace-nowrap w-full sm:w-auto shadow-sm">
                                            <Save className="w-5 h-5" /> {loading ? "..." : "Zapisz usługę"}
                                        </button>
                                    </form>

                                    <div className="space-y-4 grid sm:grid-cols-2 gap-4">
                                        {services.map((srv: any) => (
                                            <div key={srv.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#061125] flex justify-between items-center group">
                                                <div>
                                                    <p className="font-bold dark:text-white">{srv.title}</p>
                                                    <p className="text-slate-500 text-sm mt-1">{srv.description}</p>
                                                </div>
                                                <button onClick={() => handleDeleteSectionObj(setServices, deleteService, srv.id, srv.title)} className="p-2 ml-4 bg-red-100 opacity-0 group-hover:opacity-100 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
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
                            {/* SUBTABS DLA SEO */}
                            <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-[#0D1A30] p-2 rounded-xl border border-slate-200 dark:border-slate-800 mb-8 sm:mb-12">
                                <button type="button" onClick={() => setActiveSeoTab("seoSettings")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeSeoTab === "seoSettings" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Ustawienia SEO</button>
                                <button type="button" onClick={() => setActiveSeoTab("openGraph")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeSeoTab === "openGraph" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Social Media (Open Graph)</button>
                                <button type="button" onClick={() => setActiveSeoTab("integrations")} className={`flex-1 min-w-[120px] px-4 py-3 rounded-lg font-bold transition-all ${activeSeoTab === "integrations" ? "bg-white dark:bg-[#152744] shadow-sm text-brand-orange" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"}`}>Integracje (Analytics / Pixel)</button>
                            </div>

                            {activeSeoTab === "seoSettings" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Ustawienia metadanych (Google SEO)</h3>
                                    <p className="text-sm text-slate-500 mb-4">Te informacje pojawią się głównie w wynikach wyszukiwania w Google.</p>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tytuł Strony (Meta Title)</label>
                                        <input value={settings.title || ""} onChange={(e) => setSettings({ ...settings, title: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Opis Strony (Meta Description)</label>
                                        <textarea rows={3} value={settings.description || ""} onChange={(e) => setSettings({ ...settings, description: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Słowa kluczowe (po przecinku)</label>
                                        <input value={settings.keywords || ""} onChange={(e) => setSettings({ ...settings, keywords: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                    </div>
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="mt-8 px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 hover:opacity-80">
                                        <Save className="w-6 h-6" /> {loading ? "Zapisywanie w tle..." : "Zapisz ustawienia SEO"}
                                    </button>
                                </form>
                            )}

                            {activeSeoTab === "openGraph" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Wygląd udostępnianych linków (Open Graph)</h3>
                                    <p className="text-sm text-slate-500 mb-4">Te ustawienia precyzują, jak wygląda link z Twoją witryną, gdy komuś go wyślesz na Facebooku, LinkedIn, WhatsAppie czy w iMessage. Jeżeli zostawisz je puste, system pożyczy domyślny tytuł, opis i logo strony z innych zakładek.</p>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tytuł widoczny w komunikatorze (OG Title)</label>
                                        <input placeholder="np. Mój Tytuł Specjalnie pod Facebooka" value={settings.ogTitle || ""} onChange={(e) => setSettings({ ...settings, ogTitle: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Opis pod linkiem (OG Description)</label>
                                        <textarea rows={3} placeholder="Krótki tekst zachęcający do wejścia udostępniany razem z obrazkiem..." value={settings.ogDescription || ""} onChange={(e) => setSettings({ ...settings, ogDescription: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"></textarea>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Obrazek podglądowy (OG Image)</label>
                                        {settings.ogImageUrl ? (
                                            <div className="relative inline-block border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-[#061125] w-full">
                                                <img src={settings.ogImageUrl} alt="OG Image" className="max-h-32 w-auto object-contain mb-4 rounded-lg" />
                                                <button type="button" onClick={() => handleFileDelete('ogImageUrl')} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg transition-all font-bold">
                                                    <Trash2 className="w-4 h-4" /> Usuń Obecne Zdjęcie
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#061125] transition-all group">
                                                <Plus className="w-8 h-8 text-slate-400 group-hover:text-brand-orange mb-2" />
                                                <span className="text-sm font-bold text-slate-500 group-hover:text-brand-orange transition-colors">Wybierz zdjęcie z dysku...</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'ogImageUrl')} />
                                            </label>
                                        )}
                                        <p className="text-xs text-slate-500 mt-2">Zalecany wymiar to 1200x630px.</p>
                                    </div>
                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="mt-8 px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 hover:opacity-80">
                                        <Save className="w-6 h-6" /> {loading ? "Zapisywanie w tle..." : "Zapisz ułożenie Open Graph"}
                                    </button>
                                </form>
                            )}

                            {activeSeoTab === "integrations" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    <h3 className="text-xl font-bold dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Integracje z zewnętrznymi narzędziami</h3>

                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                            Google Analytics (Twój identyfikator śledzenia)
                                        </label>
                                        <p className="text-xs text-slate-500 mb-3">Wpisz sam identyfikator (np. G-XXXXXXXXXX), system automatycznie wstrzyknie odpowiedni kod na twoją stronę.</p>
                                        <input placeholder="G-XXXXXXXXXX" value={settings.googleAnalyticsId || ""} onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })} className="w-full max-w-md font-mono px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                    </div>

                                    <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30 mt-4">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                                            Meta Pixel (Identyfikator Pixela)
                                        </label>
                                        <p className="text-xs text-slate-500 mb-3">Wpisz sam identyfikator numeryczny (np. 1234567890), bez potrzeby wklejania potężnych skryptów HTML przez Facebook Ads.</p>
                                        <input placeholder="1234567890" value={settings.metaPixelId || ""} onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })} className="w-full max-w-md font-mono px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mt-4">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Inne, niestandardowe skrypty (na zaawansowane potrzeby)</label>
                                        <p className="text-xs text-slate-500 mb-3">Tu wklej gotowe tagi &lt;script&gt; lub kod HTML z jakichkolwiek innych zewnętrznych narzędzi (Hotjar, cokolwiek).</p>
                                        <textarea rows={4} placeholder="<script>...</script>" value={settings.trackingScript || ""} onChange={(e) => setSettings({ ...settings, trackingScript: e.target.value })} className="w-full font-mono text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"></textarea>
                                    </div>

                                    <button disabled={loading} type="submit" style={{ backgroundColor: "#10b981", color: "white" }} className="mt-8 px-8 py-3 rounded-xl text-lg font-bold transition-all shadow-lg flex items-center justify-center gap-3 hover:opacity-80">
                                        <Save className="w-6 h-6" /> {loading ? "Zapisywanie w tle..." : "Zapisz integracje"}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                    {/* --- TAB: MAILING --- */}
                    {activeTab === "mailing" && (
                        <div>
                            <h3 className="text-xl font-bold dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-brand-orange" /> Mailing i Newsletter
                            </h3>

                            {/* Sub-tabs */}
                            <div className="flex gap-2 mb-8">
                                {[{ id: "config", label: "Konfiguracja", icon: <Settings className="w-4 h-4" /> },
                                { id: "newsletter", label: "Newsletter", icon: <Users className="w-4 h-4" /> }].map(t => (
                                    <button key={t.id} onClick={() => setActiveMailTab(t.id)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeMailTab === t.id ? "bg-brand-orange text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"}`}>
                                        {t.icon}{t.label}
                                    </button>
                                ))}
                            </div>

                            {/* KONFIGURACJA */}
                            {activeMailTab === "config" && (
                                <form onSubmit={handleSaveSettings} className="space-y-6">
                                    {/* Provider select */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Dostawca e-mail</label>
                                        <div className="flex gap-3">
                                            {["smtp", "resend"].map(p => (
                                                <button type="button" key={p} onClick={() => setSettings({ ...settings, emailProvider: p })}
                                                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm border-2 transition-all ${settings.emailProvider === p ? "border-brand-orange bg-brand-orange/10 text-brand-orange" : "border-slate-200 dark:border-slate-700 text-slate-500"}`}>
                                                    {p === "smtp" ? "📧 SMTP" : "⚡ Resend"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Notification email */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">📬 Email do powiadomień o zgłoszeniach</label>
                                        <input value={settings.notificationEmail || ""} onChange={e => setSettings({ ...settings, notificationEmail: e.target.value })}
                                            placeholder="np. twoj@email.pl" type="email"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                        <p className="text-xs text-slate-400 mt-1">Gdy ktoś wyśle formularz kontaktowy, dostaniesz powiadomienie na ten adres.</p>
                                    </div>

                                    {/* SMTP config */}
                                    {settings.emailProvider !== "resend" && (
                                        <div className="space-y-4">
                                            <h4 className="font-bold dark:text-white">Ustawienia SMTP</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Host SMTP</label>
                                                    <input value={settings.smtpHost || ""} onChange={e => setSettings({ ...settings, smtpHost: e.target.value })}
                                                        placeholder="smtp.gmail.com"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Port SMTP</label>
                                                    <input value={settings.smtpPort || 587} onChange={e => setSettings({ ...settings, smtpPort: parseInt(e.target.value) })}
                                                        type="number" placeholder="587"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Użytkownik SMTP</label>
                                                    <input value={settings.smtpUser || ""} onChange={e => setSettings({ ...settings, smtpUser: e.target.value })}
                                                        placeholder="twoj@gmail.com"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Hasło / App Password</label>
                                                    <div className="relative">
                                                        <input value={settings.smtpPass || ""} onChange={e => setSettings({ ...settings, smtpPass: e.target.value })}
                                                            type={showSmtpPass ? "text" : "password"} placeholder="••••••••"
                                                            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                                        <button type="button" onClick={() => setShowSmtpPass(!showSmtpPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                            {showSmtpPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adres nadawcy (From)</label>
                                                    <input value={settings.smtpFrom || ""} onChange={e => setSettings({ ...settings, smtpFrom: e.target.value })}
                                                        placeholder="Elektryk Bez Spięcia <kontakt@elektrykbezspiecia.pl>"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resend config */}
                                    {settings.emailProvider === "resend" && (
                                        <div className="space-y-4">
                                            <h4 className="font-bold dark:text-white">Ustawienia Resend</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Klucz API Resend</label>
                                                    <div className="relative">
                                                        <input value={settings.resendApiKey || ""} onChange={e => setSettings({ ...settings, resendApiKey: e.target.value })}
                                                            type={showResendKey ? "text" : "password"} placeholder="re_••••••••••••••••••"
                                                            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                                        <button type="button" onClick={() => setShowResendKey(!showResendKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                            {showResendKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1">Utwórz klucz na <a href="https://resend.com" target="_blank" className="text-brand-orange underline">resend.com</a></p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adres nadawcy (From)</label>
                                                    <input value={settings.smtpFrom || ""} onChange={e => setSettings({ ...settings, smtpFrom: e.target.value })}
                                                        placeholder="Elektryk Bez Spięcia <kontakt@elektrykbezspiecia.pl>"
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                                    <p className="text-xs text-slate-400 mt-1">Domena musi być zweryfikowana w Resend.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {showTestInput && (
                                            <div className="p-4 bg-brand-orange/5 border border-brand-orange/20 rounded-2xl flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-top-2">
                                                <input
                                                    type="email"
                                                    value={testEmail}
                                                    onChange={e => setTestEmail(e.target.value)}
                                                    placeholder="Wpisz e-mail do testu..."
                                                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white outline-none focus:ring-2 focus:ring-brand-orange"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={loading || !testEmail}
                                                    onClick={async () => {
                                                        setLoading(true);
                                                        try {
                                                            const { testEmailConnection } = await import("@/app/adminpanel/actions");
                                                            const res = await testEmailConnection(testEmail);
                                                            if (res.success) alert("Wiadomość testowa została wysłana!");
                                                            else alert("Błąd: " + res.error);
                                                        } catch (err) {
                                                            alert("Wystąpił błąd podczas testu.");
                                                        }
                                                        setLoading(false);
                                                        setShowTestInput(false);
                                                    }}
                                                    className="px-6 py-2 bg-brand-navy dark:bg-slate-700 text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                                                >
                                                    Wyślij Test
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <button
                                                type="button"
                                                disabled={loading}
                                                onClick={() => {
                                                    if (!showTestInput) {
                                                        setTestEmail(settings.contactMail || "");
                                                        setShowTestInput(true);
                                                    } else {
                                                        setShowTestInput(false);
                                                    }
                                                }}
                                                className={`flex-1 py-4 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${showTestInput ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"}`}>
                                                <Send className="w-5 h-5 text-brand-orange" /> {showTestInput ? "Anuluj Test" : "Testuj połączenie"}
                                            </button>
                                            <button type="submit" disabled={loading}
                                                className="flex-[2] py-4 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                                <Save className="w-5 h-5" /> {loading ? "Zapisywanie..." : "Zapisz konfigurację"}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {/* NEWSLETTER */}
                            {activeMailTab === "newsletter" && (
                                <div className="space-y-8">
                                    {/* Wyślij kampanię */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                        <h4 className="font-bold dark:text-white mb-4 flex items-center gap-2"><Send className="w-5 h-5 text-brand-orange" /> Wyślij kampanię newsletterową</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Temat wiadomości</label>
                                                <input value={newsletterSubject} onChange={e => setNewsletterSubject(e.target.value)}
                                                    placeholder="np. Wiosenna promocja – 20% rabatu!"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Treść (HTML)</label>
                                                <textarea value={newsletterHtml} onChange={e => setNewsletterHtml(e.target.value)}
                                                    rows={8} placeholder="<h1>Drogi Kliencie!</h1><p>Mamy dla Ciebie wyjątkową ofertę...</p>"
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none font-mono text-sm" />
                                                <p className="text-xs text-slate-400 mt-1">Możesz pisać w HTML. Do każdej wiadomości automatycznie dodawany jest link do wypisania się.</p>
                                            </div>
                                            <button onClick={async () => {
                                                if (!newsletterSubject || !newsletterHtml) { alert("Wypełnij temat i treść."); return; }
                                                if (!confirm(`Wysłać newsletter do ${subscribers.filter(s => s.isActive).length} subskrybentów?`)) return;
                                                setSendingNewsletter(true);
                                                const res = await fetch("/api/newsletter/send", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ subject: newsletterSubject, html: newsletterHtml }),
                                                });
                                                const data = await res.json();
                                                setSendingNewsletter(false);
                                                if (data.success) alert(`✅ Wysłano: ${data.sent} | Błędy: ${data.failed}`);
                                                else alert(`❌ Błąd: ${data.error}`);
                                            }}
                                                disabled={sendingNewsletter}
                                                className="w-full py-4 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                                                <Send className="w-5 h-5" /> {sendingNewsletter ? "Wysyłanie..." : `Wyślij do ${subscribers.filter(s => s.isActive).length} subskrybentów`}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Lista subskrybentów */}
                                    <div>
                                        <h4 className="font-bold dark:text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-brand-orange" /> Lista subskrybentów ({subscribers.filter(s => s.isActive).length} aktywnych)</h4>
                                        {subscribers.length === 0 ? (
                                            <p className="text-slate-400 text-sm text-center py-8">Brak subskrybentów. Dodaj formularz newslettera na stronie.</p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-slate-200 dark:border-slate-700">
                                                            <th className="text-left py-3 px-2 font-bold text-slate-600 dark:text-slate-400">E-mail</th>
                                                            <th className="text-left py-3 px-2 font-bold text-slate-600 dark:text-slate-400">Imię</th>
                                                            <th className="text-left py-3 px-2 font-bold text-slate-600 dark:text-slate-400">Status</th>
                                                            <th className="text-left py-3 px-2 font-bold text-slate-600 dark:text-slate-400">Data</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {subscribers.map(sub => (
                                                            <tr key={sub.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                                <td className="py-3 px-2 dark:text-white font-medium">{sub.email}</td>
                                                                <td className="py-3 px-2 text-slate-500">{sub.name || "—"}</td>
                                                                <td className="py-3 px-2">
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${sub.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                                        {sub.isActive ? "✓ Aktywny" : "✗ Wypisany"}
                                                                    </span>
                                                                </td>
                                                                <td className="py-3 px-2 text-slate-400">{new Date(sub.createdAt).toLocaleDateString("pl-PL")}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
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
