"use client";

import { useState } from "react";
import { Key, Save, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { finishForcePasswordChange } from "@/app/adminpanel/actions";
import { signOut } from "next-auth/react";

export default function ForcePasswordChange({ userId, userEmail }: { userId: string, userEmail: string }) {
    const [pass, setPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (pass.length < 6) {
            setError("Hasło musi mieć co najmniej 6 znaków.");
            return;
        }

        if (pass !== confirmPass) {
            setError("Hasła nie są identyczne.");
            return;
        }

        setLoading(true);
        try {
            const res = await finishForcePasswordChange(userId, pass);
            if (res.success) {
                alert("Hasło zostało zmienione! Zaloguj się ponownie nowym hasłem.");
                await signOut({ callbackUrl: "/login" });
            }
        } catch (err) {
            setError("Błąd podczas zapisywania hasła.");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-brand-navy/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0A1C3B] w-full max-w-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform animate-in fade-in zoom-in duration-300">
                <div className="bg-brand-orange p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold">Wymagana zmiana hasła</h2>
                    <p className="opacity-90 text-sm mt-2">Dla Twojego bezpieczeństwa musisz ustawić nowe hasło przy pierwszym logowaniu.</p>
                </div>

                <div className="p-8">
                    <p className="text-sm text-slate-500 mb-6 text-center">Zalogowano jako: <strong>{userEmail}</strong></p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nowe Hasło</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    type="password"
                                    value={pass}
                                    onChange={e => setPass(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"
                                    placeholder="Minimum 6 znaków"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Powtórz Nowe Hasło</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    required
                                    type="password"
                                    value={confirmPass}
                                    onChange={e => setConfirmPass(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"
                                    placeholder="Wpisz ponownie"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-bold rounded-lg flex items-center gap-2 animate-pulse">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? "Zapisywanie..." : "Ustaw nowe hasło"}
                        </button>
                    </form>

                    <div className="mt-8 space-y-3">
                        <div className="flex items-start gap-3 text-[11px] text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <p>Twoje dane logowania zostaną zaktualizowane i bezpiecznie zaszyfrowane.</p>
                        </div>
                        <div className="flex items-start gap-3 text-[11px] text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <p>Otrzymasz potwierdzenie zmiany na swój adres e-mail.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
