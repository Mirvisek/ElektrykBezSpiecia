import Link from "next/link";
import { Zap, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden">
            {/* Dekoracja w tle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none" />

            <MotionWrapper>
                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-brand-orange/20 rounded-3xl flex items-center justify-center mb-8 animate-bounce">
                        <Zap className="w-12 h-12 text-brand-orange fill-current" />
                    </div>

                    <h1 className="text-8xl sm:text-[10rem] font-extrabold text-white leading-none tracking-tighter mb-4 opacity-50 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        404
                    </h1>

                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">
                        Uuuups... Wybiło korki! ⚡
                    </h2>

                    <p className="max-w-md text-slate-400 text-lg mb-10 leading-relaxed">
                        Strona, której szukasz, nie istnieje lub została przeniesiona do innej rozdzielni. Wróć na bezpieczny teren!
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link href="/" className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                            <Home className="w-5 h-5" />
                            Strona główna
                        </Link>
                        <Link href="/kontakt" className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-4 rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                            <ArrowLeft className="w-5 h-5" />
                            Skontaktuj się
                        </Link>
                    </div>
                </div>
            </MotionWrapper>
        </div>
    );
}

// Simple wrapper since this is a server component by default
function MotionWrapper({ children }: { children: React.ReactNode }) {
    return children;
}
