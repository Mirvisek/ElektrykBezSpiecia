import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AlertTriangle } from "lucide-react";
import { SiteSetting } from "@/types/prisma";

export default async function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await prisma.siteSetting.findFirst({ where: { id: "global" } });

    return (
        <div className="flex flex-col min-h-screen">
            {/* TOP BANNER */}
            {settings?.topBannerActive && settings?.topBannerText && (
                <div className="fixed top-0 left-0 w-full z-[60] bg-brand-orange text-white py-2 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="truncate max-w-4xl">{settings.topBannerText}</span>
                </div>
            )}
            <Navbar settings={settings} />
            <main className="flex-grow">
                {children}
            </main>
            <Footer settings={settings} />
        </div>
    );
}
