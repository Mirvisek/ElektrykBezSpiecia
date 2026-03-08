import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { default as NextAuthSignOut } from "@/components/LogoutButton";
import { Wrench, PhoneCall, Star, Search, Images, FileText, Users } from "lucide-react";

export default async function AdminPanelPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125]">
            <div className="w-full bg-[#0A1C3B] text-white p-4 flex justify-between items-center border-b border-brand-orange/30">
                <h1 className="font-bold text-lg flex items-center">
                    <span className="text-brand-orange mr-2">⚡</span> Elektryk Bez Spięcia - Admin
                </h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400 hidden sm:block">Zalogowano: {session.user.email}</span>
                    <NextAuthSignOut />
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">
                <h2 className="text-3xl font-bold dark:text-white mb-6">Witaj w Panelu Administratora</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Zgłoszenia i Wiadomości */}
                    <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:border-brand-orange/50 transition-colors">
                        <PhoneCall className="w-8 h-8 text-brand-orange mb-4" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">Zgłoszenia awarii</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 min-h-[40px]">
                            Skrzynka kontaktowa. Zobacz kto prosi o wycenę lub zgłasza usterkę.
                        </p>
                        <Link href="/adminpanel/messages">
                            <button className="w-full bg-brand-navy dark:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange transition-colors">
                                Przeglądaj
                            </button>
                        </Link>
                    </div>

                    {/* Aplikacje Narzędziowe */}
                    <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-lg border border-brand-orange/40 hover:border-brand-orange/80 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/10 rounded-bl-full -mr-4 -mt-4" />
                        <Wrench className="w-8 h-8 text-brand-orange mb-4 relative z-10" />
                        <h3 className="text-xl font-bold dark:text-white mb-2 relative z-10">Aplikacje CRM</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 min-h-[40px] relative z-10">
                            Twoje faktury, magazyn, kalendarz, narzędzia i kilometrówki.
                        </p>
                        <Link href="/aplikacje">
                            <button className="w-full bg-brand-orange text-brand-navy px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-orange-dark shadow-[0_0_15px_rgba(245,142,11,0.3)] transition-all">
                                Otwórz Aplikację
                            </button>
                        </Link>
                    </div>

                    {/* Edytor Głównej SEO */}
                    <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:border-brand-orange/50 transition-colors">
                        <Search className="w-8 h-8 text-brand-orange mb-4" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">Edytor Strony SEO</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 min-h-[40px]">
                            Edytuj tytuły, usługi, karuzelę, i SEO dla wyszukiwarki Google.
                        </p>
                        <Link href="/adminpanel/seo">
                            <button className="w-full bg-brand-navy dark:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange transition-colors">
                                Zarządzaj wyglądem
                            </button>
                        </Link>
                    </div>

                    {/* Opinie Klientów */}
                    <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:border-brand-orange/50 transition-colors">
                        <Star className="w-8 h-8 text-brand-orange mb-4" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">Opinie i Referencje</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 min-h-[40px]">
                            Dodawaj nowe opinie od klientów pojawiające się na Stronie Głównej.
                        </p>
                        <Link href="/adminpanel/testimonials">
                            <button className="w-full bg-brand-navy dark:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange transition-colors">
                                Dodaj opinię
                            </button>
                        </Link>
                    </div>

                    {/* Realizacje */}
                    <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:border-brand-orange/50 transition-colors">
                        <Images className="w-8 h-8 text-brand-orange mb-4" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">Realizacje</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 min-h-[40px]">
                            Dodawaj, edytuj i usuwaj realizacje widoczne na stronie /realizacje.
                        </p>
                        <Link href="/adminpanel/realizacje">
                            <button className="w-full bg-brand-navy dark:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange transition-colors">
                                Zarządzaj realizacjami
                            </button>
                        </Link>
                    </div>

                    {/* Blog */}
                    <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:border-brand-orange/50 transition-colors">
                        <FileText className="w-8 h-8 text-brand-orange mb-4" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">Blog</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 min-h-[40px]">
                            Twórz artykuły i porady elektryczne widoczne na stronie /blog.
                        </p>
                        <Link href="/adminpanel/blog">
                            <button className="w-full bg-brand-navy dark:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange transition-colors">
                                Zarządzaj blogiem
                            </button>
                        </Link>
                    </div>

                    {/* Słowniczek (Dictionary) */}
                    <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:border-brand-orange/50 transition-colors">
                        <FileText className="w-8 h-8 text-brand-orange mb-4" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">Słowniczek</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 min-h-[40px]">
                            Wyjaśniaj trudne pojęcia i buduj świetne pozycjonowanie SEO strony.
                        </p>
                        <Link href="/adminpanel/dictionary">
                            <button className="w-full bg-brand-navy dark:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange transition-colors">
                                Słowniczek Elektryczny
                            </button>
                        </Link>
                    </div>

                    {/* Zarządzanie Użytkownikami */}
                    <div className="bg-white dark:bg-[#0A1C3B] p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 hover:border-brand-orange/50 transition-colors">
                        <Users className="w-8 h-8 text-brand-orange mb-4" />
                        <h3 className="text-xl font-bold dark:text-white mb-2">Użytkownicy i Hasła</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 min-h-[40px]">
                            Zarządzaj dostępem do panelu, dodawaj adminów i zmieniaj hasła.
                        </p>
                        <Link href="/adminpanel/users">
                            <button className="w-full bg-brand-navy dark:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-orange transition-colors">
                                Zarządzaj kontami
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
