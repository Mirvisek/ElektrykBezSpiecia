"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, ArrowRight } from "lucide-react";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            console.log(`Próba logowania dla: ${email}...`);
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (res?.error) {
                console.error("Logowanie nieudane:", res.error);
                setError("Nieprawidłowy adres email lub hasło.");
                setLoading(false);
            } else {
                console.log("Logowanie zakończone sukcesem!");
                setSuccess(true);
                setTimeout(() => {
                    router.push("/adminpanel");
                    router.refresh();
                }, 1000);
            }
        } catch (err) {
            console.error("Nieoczekiwany błąd logowania:", err);
            setError("Wystąpił nieoczekiwany błąd. Spróbuj ponownie.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4 rounded-md shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                        Adres Email
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0A1C3B]/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-white placeholder-slate-500 transition-all duration-200 shadow-inner"
                        placeholder="admin@elektryk.pl"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                        Hasło dostępu
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-[#0A1C3B]/50 border border-slate-700/50 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange text-white placeholder-slate-500 transition-all duration-200 shadow-inner"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-in fade-in zoom-in duration-300">
                    <p className="text-sm text-red-400 text-center font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg animate-in fade-in zoom-in duration-300">
                    <p className="text-sm text-green-400 text-center font-medium">Logowanie pomyślne! Zaraz zostaniesz przekierowany...</p>
                </div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="group relative flex w-full justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-brand-navy bg-brand-orange hover:bg-brand-orange-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-orange focus:ring-offset-[#061125] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,142,11,0.3)] hover:shadow-[0_0_30px_rgba(245,142,11,0.5)]"
                >
                    {loading ? (
                        <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                        <>
                            Zaloguj do systemu
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
