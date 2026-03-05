"use client";
import { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";

export default function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                setEmail("");
                setName("");
            } else {
                setError(data.error || "Wystąpił błąd.");
            }
        } catch {
            setError("Brak połączenia z serwerem.");
        }
        setLoading(false);
    };

    return (
        <div className="bg-slate-800/50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-brand-orange" />
                <h4 className="text-white font-bold">Newsletter</h4>
            </div>
            <p className="text-slate-400 text-sm mb-4">Zapisz się i bądź na bieżąco z promocjami!</p>

            {success ? (
                <div className="flex items-center gap-2 text-green-400 font-medium">
                    <CheckCircle className="w-5 h-5" />
                    <span>Zapisano pomyślnie! Sprawdź skrzynkę e-mail.</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Twoje imię (opcjonalnie)"
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-brand-orange outline-none"
                    />
                    <div className="flex gap-2">
                        <input
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="twoj@email.pl" required
                            className="flex-1 px-3 py-2.5 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-brand-orange outline-none"
                        />
                        <button type="submit" disabled={loading}
                            className="bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <p className="text-slate-500 text-[11px]">Możesz wypisać się w każdej chwili. Nie spamujemy.</p>
                </form>
            )}
        </div>
    );
}
