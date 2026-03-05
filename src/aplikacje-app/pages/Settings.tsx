import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Settings as SettingsIcon, Save, Info, AlertTriangle, Download, Upload } from 'lucide-react';
import { exportDB, importInto } from 'dexie-export-import';
import { saveAs } from 'file-saver';

export default function Settings() {
    const settings = useLiveQuery(() => db.settings.get(1));

    const [myName, setMyName] = useState('');
    const [myAddress, setMyAddress] = useState('');
    const [bankAccount, setBankAccount] = useState('');
    const [limit, setLimit] = useState('');
    const [exemption, setExemption] = useState('');

    useEffect(() => {
        if (settings) {
            setMyName(settings.myName);
            setMyAddress(settings.myAddress);
            setBankAccount(settings.bankAccount || '');
            setLimit(settings.quarterlyLimit.toString());
            setExemption(settings.exemptionBasis);
        }
    }, [settings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await db.settings.put({
            id: 1,
            myName,
            myAddress,
            bankAccount,
            quarterlyLimit: parseFloat(limit),
            exemptionBasis: exemption
        });
        alert('Zapisano ustawienia.');
    };

    return (
        <div className="container">
            <h1>Ustawienia Działalności</h1>
            <p style={{ color: 'var(--text-muted)' }}>Konfiguracja Twojej firmy, potrzebna do prawidłowego generowania rachunków.</p>

            <div className="grid grid-2" style={{ marginTop: '32px' }}>
                <div className="glass-panel">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <SettingsIcon size={24} color="var(--primary-color)" /> Twoje Dane
                    </h2>
                    <form onSubmit={handleSave} style={{ marginTop: '24px' }}>
                        <div className="form-group">
                            <label>Sprzedawca (Twoje i Nazwisko / Nazwa Działalności)</label>
                            <textarea value={myName} onChange={e => setMyName(e.target.value)} rows={2} required />
                        </div>
                        <div className="form-group">
                            <label>Twój Adres (Kod, Miasto, Ulica)</label>
                            <textarea value={myAddress} onChange={e => setMyAddress(e.target.value)} rows={3} required />
                        </div>
                        <div className="form-group">
                            <label>Numer Konta Bankowego</label>
                            <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} placeholder="00 0000 0000 0000 0000 0000 0000" />
                        </div>

                        <div className="form-group" style={{ marginTop: '24px' }}>
                            <label>Podstawa zwolnienia z VAT (pokazywana pod kwotą na rachunku)</label>
                            <textarea value={exemption} onChange={e => setExemption(e.target.value)} rows={2} required />
                        </div>

                        <div className="form-group" style={{ marginTop: '24px' }}>
                            <label style={{ color: 'var(--warning-color)' }}>Limit Działalności Nierejestrowanej (Kwartalny)</label>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>W 2026 roku stawka ta może się zmieniać. Zawsze wpisz tu właściwą kwotę dla CAŁEGO kwartału.</p>
                            <input type="number" step="0.01" value={limit} onChange={e => setLimit(e.target.value)} required />
                            <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '8px', display: 'flex', gap: '8px', fontSize: '0.85rem', color: 'var(--warning-color)' }}>
                                <AlertTriangle size={16} /> Limity stale rosną, pilnuj ich dla własnego bezpieczeństwa. Jeśli przekroczysz, musisz w ciągu 7 dni zarejestrować działalność gospodarczą.
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '24px', width: '100%' }}>
                            <Save size={18} /> Zapisz ustawienia
                        </button>
                    </form>
                </div>

                <div className="glass-panel" style={{ alignSelf: 'start' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Info size={24} color="var(--secondary-color)" /> Poradnik Elektryka 2026
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <p style={{ marginBottom: '12px' }}><strong>Dla kogo jest ten program?</strong><br />Stworzony z myślą o usługach m.in. elektrycznych, pomiarowych bez konieczności zakładania DG.</p>
                        <p style={{ marginBottom: '12px' }}><strong>Podatek dochodowy</strong><br />Na początku 2027 roku w swoim PIT-36 będziesz musiał podać przychody oraz koszty uzyskane w dziale: Inne Przychody. Od różnicy (jeśli jest mniejsza niż kwota wolna) zapłacisz podatek dochodowy.</p>
                        <p style={{ marginBottom: '12px' }}><strong>Zwolnienie z VAT dla elektryków</strong><br />Jako elektryk wykonujący usługi u klientów możesz korzystać ze zwolnienia z VAT do limitu 200 000 zł rocznie, pod warunkiem, że NIE ŚWIADCZYSZ usług doradczych budowlanych ani projektowych. Wymiana, serwis czy pomiary podlegają zawsze pod zwolnienie.</p>
                    </div>

                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', marginTop: '32px' }}>
                        <Save size={24} color="var(--success-color)" /> Kopia Zapasowa (Backup)
                    </h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Wszystkie Twoje dane (rachunki, ustawienia, klienci) są przechowywane wyłącznie na Twoim urządzeniu. Pobierz kopię, aby je zabezpieczyć.
                    </div>
                    <div className="grid grid-2" style={{ gap: '16px' }}>
                        <button onClick={async () => {
                            try {
                                const blob = await exportDB(db);
                                saveAs(blob, `dzialalnosc_backup_${new Date().toISOString().slice(0, 10)}.json`);
                            } catch (e) {
                                alert('Błąd eksportu: ' + e);
                            }
                        }} className="btn btn-outline" style={{ justifyContent: 'center' }}>
                            <Download size={18} /> Pobierz Kopię .json
                        </button>

                        <label className="btn btn-outline" style={{ justifyContent: 'center', cursor: 'pointer' }}>
                            <Upload size={18} /> Wgraj Kopię .json
                            <input type="file" accept=".json" style={{ display: 'none' }} onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (confirm('UWAGA! Wgranie kopii NADPISZE Twoje obecne dane w programie. Czy kontynuować?')) {
                                    try {
                                        await db.delete();
                                        await importInto(db, file);
                                        window.location.reload();
                                    } catch (err) {
                                        alert('Błąd importu plików zapisu: ' + err);
                                    }
                                }
                            }} />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
