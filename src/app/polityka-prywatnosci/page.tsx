import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Zap } from "lucide-react";

export const metadata = {
    title: "Polityka Prywatności | Elektryk Bez Spięcia",
    description: "Polityka prywatności i ochrony danych osobowych serwisu Elektryk Bez Spięcia.",
};

export default async function PolitykaPrywatnosci() {
    const settings = await prisma.siteSetting.findUnique({ where: { id: "global" } });
    const phone = settings?.contactPhone || "";
    const email = settings?.contactMail || "";
    const address = settings?.address || "";
    const siteName = settings?.title || "Elektryk Bez Spięcia";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] text-brand-navy dark:text-slate-100 font-sans">
            {/* NAVBAR */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-[#0A1C3B]/90 backdrop-blur-md shadow-sm border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        {settings?.logoUrl ? (
                            <img src={settings.logoUrl} alt="Logo" className="max-h-12 w-auto object-contain" />
                        ) : (
                            <>
                                <Zap className="h-8 w-8 text-brand-orange fill-current" />
                                <span className="text-xl font-bold dark:text-white">
                                    Elektryk<br />
                                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400 leading-tight block -mt-1">Bez Spięcia</span>
                                </span>
                            </>
                        )}
                    </Link>
                    <Link href="/" className="text-sm font-medium bg-brand-orange text-white px-4 py-2 rounded-xl hover:bg-brand-orange-dark transition-colors">
                        ← Wróć na stronę główną
                    </Link>
                </div>
            </header>

            {/* HERO */}
            <section className="pt-28 pb-12 bg-brand-navy text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-brand-orange font-bold uppercase tracking-wider text-sm mb-3">Dokument prawny</p>
                    <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Polityka Prywatności</h1>
                    <p className="text-slate-400">Ostatnia aktualizacja: marzec 2025</p>
                </div>
            </section>

            {/* CONTENT */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white dark:bg-[#0A1C3B] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 sm:p-12 prose prose-slate dark:prose-invert max-w-none">

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">1. Administrator danych osobowych</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Administratorem Twoich danych osobowych jest <strong>{siteName}</strong>, prowadzący działalność gospodarczą pod adresem: <strong>{address}</strong>.
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                            W sprawach związanych z ochroną danych osobowych możesz kontaktować się z nami:
                        </p>
                        <ul className="mt-3 space-y-1 text-slate-600 dark:text-slate-400">
                            <li>📞 Telefonicznie: <a href={`tel:${phone.replace(/\s+/g, "")}`} className="text-brand-orange font-medium">{phone}</a></li>
                            <li>✉️ E-mail: <a href={`mailto:${email}`} className="text-brand-orange font-medium">{email}</a></li>
                            <li>📍 Adres: {address}</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">2. Jakie dane zbieramy?</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Za pośrednictwem formularza kontaktowego na stronie zbieramy następujące dane:</p>
                        <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                            <li>Imię i nazwisko lub nazwa firmy</li>
                            <li>Numer telefonu</li>
                            <li>Adres e-mail</li>
                            <li>Treść wiadomości / opis zlecenia</li>
                        </ul>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                            Ponadto, automatycznie zbieramy dane techniczne za pomocą plików cookies: adres IP, typ przeglądarki, czas wizyty, odwiedzone podstrony.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">3. Cel i podstawa przetwarzania danych</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse mt-3">
                                <thead>
                                    <tr className="bg-slate-100 dark:bg-slate-800">
                                        <th className="text-left p-3 font-bold text-brand-navy dark:text-white rounded-tl-lg">Cel przetwarzania</th>
                                        <th className="text-left p-3 font-bold text-brand-navy dark:text-white rounded-tr-lg">Podstawa prawna</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Odpowiedź na zapytanie kontaktowe</td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Art. 6 ust. 1 lit. b RODO (wykonanie umowy / działania przedumowne)</td>
                                    </tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Analityka strony (Google Analytics)</td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Art. 6 ust. 1 lit. a RODO (zgoda)</td>
                                    </tr>
                                    <tr className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Marketing (Meta Pixel / Facebook)</td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">Art. 6 ust. 1 lit. a RODO (zgoda)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">4. Pliki cookies</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Nasza strona używa plików cookies (ciasteczek). Są to małe pliki tekstowe zapisywane w Twojej przeglądarce. Służą do:
                        </p>
                        <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                            <li><strong>Cookies niezbędne</strong> — zapewniają prawidłowe działanie strony</li>
                            <li><strong>Cookies analityczne</strong> — Google Analytics (zbieranie statystyk ruchu)</li>
                            <li><strong>Cookies marketingowe</strong> — Meta Pixel (remarketing na Facebooku/Instagramie)</li>
                        </ul>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                            Możesz w każdej chwili zmienić ustawienia cookies w swojej przeglądarce lub zrezygnować z ich używania. Należy jednak pamiętać, że wyłączenie cookies może ograniczyć funkcjonalność strony.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">5. Odbiorcy danych</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Twoje dane mogą być przekazywane następującym podmiotom zewnętrznym:
                        </p>
                        <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                            <li><strong>Google LLC</strong> — w zakresie usługi Google Analytics</li>
                            <li><strong>Meta Platforms Ireland Ltd.</strong> — w zakresie Meta Pixel i remarketingu</li>
                            <li><strong>Dostawca hostingu / VPS</strong> — przechowywanie danych na serwerze</li>
                        </ul>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                            Dane nie są sprzedawane ani udostępniane innym podmiotom w celach komercyjnych.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">6. Twoje prawa</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Na podstawie RODO przysługują Ci następujące prawa:</p>
                        <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400 list-disc list-inside">
                            <li><strong>Prawo dostępu</strong> — możesz zażądać informacji, jakie dane na Twój temat przetwarzamy</li>
                            <li><strong>Prawo do sprostowania</strong> — możesz poprosić o korektę nieprawidłowych danych</li>
                            <li><strong>Prawo do usunięcia</strong> — w określonych przypadkach możesz zażądać usunięcia danych</li>
                            <li><strong>Prawo do ograniczenia</strong> — możesz żądać ograniczenia przetwarzania Twoich danych</li>
                            <li><strong>Prawo do przenoszenia</strong> — możesz otrzymać swoje dane w ustrukturyzowanym formacie</li>
                            <li><strong>Prawo do sprzeciwu</strong> — możesz wnieść sprzeciw wobec przetwarzania danych</li>
                            <li><strong>Prawo do skargi</strong> — możesz wnieść skargę do Prezesa UODO (uodo.gov.pl)</li>
                        </ul>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                            Aby skorzystać ze swoich praw, skontaktuj się z nami pisemnie na adres e-mail: <a href={`mailto:${email}`} className="text-brand-orange font-medium">{email}</a>
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">7. Okres przechowywania danych</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Dane z formularzy kontaktowych przechowujemy przez okres niezbędny do obsługi zapytania, a następnie przez czas wymagany przepisami prawa (co do zasady 5 lat – w celach podatkowych i rachunkowych).
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
                            Dane analityczne (cookies) przechowywane są przez okres określony w polityce prywatności odpowiednio Google i Meta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-brand-navy dark:text-white mb-4">8. Zmiany polityki prywatności</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            Zastrzegamy sobie prawo do zmiany niniejszej polityki prywatności w każdej chwili. Wszelkie zmiany będą publikowane na tej stronie z aktualizacją daty. Zalecamy regularne sprawdzanie treści tego dokumentu.
                        </p>
                    </section>

                    <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                        <Link href="/" className="flex-1 text-center bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 px-6 rounded-xl transition-colors">
                            Wróć na stronę główną
                        </Link>
                        <Link href="/kontakt" className="flex-1 text-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-brand-navy dark:text-white font-bold py-3 px-6 rounded-xl transition-colors">
                            Skontaktuj się z nami
                        </Link>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="bg-brand-navy text-slate-400 py-8 text-center text-sm">
                <p>© {new Date().getFullYear()} {siteName} · <Link href="/polityka-prywatnosci" className="underline hover:text-white">Polityka Prywatności</Link></p>
            </footer>
        </div>
    );
}
