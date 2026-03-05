"use client";

import dynamic from "next/dynamic";
import React from "react";

// Ładujemy stare CSSy by style CRM zadziałały
import "@/aplikacje-app/index.css";
import "@/aplikacje-app/App.css";

// Uruchamiamy bez SSR (Client-side rendering) - rozwiązuje problemy z Dexie.js (IndexedDB) oraz React-router
const App = dynamic(() => import("@/aplikacje-app/App"), { ssr: false });

export default function CrmWrapper() {
    return (
        <div className="crm-isolated-context">
            <App />
        </div>
    );
}
