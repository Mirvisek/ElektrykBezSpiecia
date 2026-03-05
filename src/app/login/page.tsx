import { LoginForm } from "@/components/LoginForm";
import { Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Logowanie | Elektryk Bez Spięcia",
    description: "Zaloguj się do panelu administracyjnego.",
};

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#061125] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden dark">
            {/* Tło świetlne (gloria piorunu) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-tr from-brand-orange-dark to-brand-orange rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(245,142,11,0.4)] rotate-3">
                        <Zap className="w-12 h-12 text-brand-navy fill-current -rotate-3" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
                        Panel <span className="text-brand-orange">Admina</span>
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-400">
                        Zaloguj się swoimi danymi, aby kontynuować
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-[#0A1C3B]/80 backdrop-blur-xl py-8 px-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:px-10 border border-slate-700/50">
                    <LoginForm />
                </div>

                <p className="mt-8 text-center text-xs text-slate-500">
                    System zarządzania dla Elektryk Bez Spięcia
                </p>
            </div>
        </div>
    );
}
