import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FileText, Download, LogOut } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function ClientZonePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const files = await prisma.clientFile.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-[#0A1C3B] p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8 sm:mb-12">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy dark:text-white">
                            Witaj, <span className="text-brand-orange">{session.user.name || session.user.email}</span>
                        </h1>
                        <p className="text-slate-500 mt-2">To jest Twoja prywatna strefa plików elektrycznych i protokołów.</p>
                    </div>
                    <div className="mt-6 sm:mt-0">
                        <LogoutButton />
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0A1C3B] rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold dark:text-white mb-6 flex items-center gap-2">
                        <FileText className="text-brand-orange w-6 h-6" /> Twoje Dokumenty ({files.length})
                    </h2>

                    {files.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            Nie udostępniono Ci jeszcze żadnych plików.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {files.map(file => (
                                <div key={file.id} className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] hover:border-brand-orange transition-colors group">
                                    <div className="mb-4">
                                        <p className="font-bold text-slate-800 dark:text-white group-hover:text-brand-orange transition-colors truncate" title={file.name}>
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">Dodano: {file.createdAt.toLocaleDateString("pl-PL")}</p>
                                    </div>
                                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-navy dark:bg-slate-800 text-white rounded-xl font-bold hover:bg-brand-orange transition-colors text-sm">
                                        <Download className="w-4 h-4" /> Pobierz plik
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-center mt-12">
                    <Link href="/" className="text-brand-orange hover:text-brand-orange-dark font-medium underline underline-offset-4">
                        Wróć do strony głównej
                    </Link>
                </div>

            </div>
        </div>
    );
}
