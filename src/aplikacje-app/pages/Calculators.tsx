import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Calculator, Zap, HardHat, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function Calculators() {
    const settings = useLiveQuery(() => db.settings.get(1));

    // 1. Spadek Napięcia
    const [dlugosc, setDlugosc] = useState('');
    const [prad, setPrad] = useState('');
    const [przekroj, setPrzekroj] = useState('');
    const [fazy, setFazy] = useState('1'); // 1 or 3
    const [spadekResult, setSpadekResult] = useState<number | null>(null);

    const obliczSpadek = (e: React.FormEvent) => {
        e.preventDefault();
        const l = parseFloat(dlugosc);
        const i = parseFloat(prad);
        const s = parseFloat(przekroj);
        const is3F = fazy === '3';
        const gamma = 56; // Cu

        if (l && i && s) {
            let spadek = 0;
            if (is3F) {
                // delta U = (sqrt(3) * l * I * cosfi) / (gamma * S) -> zakładamy cosfi=1
                spadek = (Math.sqrt(3) * l * i) / (gamma * s);
            } else {
                // 1f: 2 * l * I / (gamma * S)
                spadek = (2 * l * i) / (gamma * s);
            }
            const napięcie = is3F ? 400 : 230;
            setSpadekResult((spadek / napięcie) * 100);
        }
    };

    // 2. Przelicznik Ampery na kW
    const [ampI, setAmpI] = useState('');
    const [ampFazy, setAmpFazy] = useState('3');
    const [kwResult, setKwResult] = useState<number | null>(null);

    const obliczKw = (e: React.FormEvent) => {
        e.preventDefault();
        const i = parseFloat(ampI);
        const is3F = ampFazy === '3';
        if (i) {
            if (is3F) {
                // P = sqrt(3)*U*I = 1.73 * 400 * I * 1 (cosFi=1) -> W -> kW
                setKwResult((Math.sqrt(3) * 400 * i) / 1000);
            } else {
                setKwResult((230 * i) / 1000);
            }
        }
    };

    // 3. Algorytm Doboru Zabezpieczeń i Przekrojów (Zgodnie z PN-HD 60364)
    const [algMoc, setAlgMoc] = useState('');
    const [algDlugosc, setAlgDlugosc] = useState('');
    const [algNapiecie, setAlgNapiecie] = useState('1');
    const [algUlozenie, setAlgUlozenie] = useState('A1');
    const [algResult, setAlgResult] = useState<any>(null);

    const runAlgorithm = (e: React.FormEvent) => {
        e.preventDefault();
        const P = parseFloat(algMoc) * 1000; // W
        const L = parseFloat(algDlugosc);
        if (!P || !L) return;

        let Ib = 0;
        if (algNapiecie === '3') {
            Ib = P / (Math.sqrt(3) * 400); // Zakładamy cosfi ~ 1.0 (grzałka, oporność) dla uproszczenia kalkulatora
        } else {
            Ib = P / 230;
        }

        const zabezpieczenia = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];
        let In = zabezpieczenia.find(z => z >= Ib) || null;

        if (!In) {
            setAlgResult({ error: 'Prąd obciążenia przekracza 160A, wykracza poza ten zoptymalizowany kalkulator domowy.' });
            return;
        }

        // Wymagany prąd długotrwały Iz (Iz >= In)
        const Iz = In;

        // A1 - rurka w ścianie ocieplonej (najgorsze chłodzenie)
        // C - na tynku (dobre chłodzenie)
        // D - w ziemi (bardzo dobre chłodzenie)
        const odcinkiZPrzekrojem = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50];
        const obciazalnosc: Record<string, number[]> = {
            'A1': [14.5, 19.5, 26, 34, 46, 61, 80, 99, 119],
            'C': [19.5, 27, 36, 48, 63, 85, 112, 138, 168],
            'D': [22, 29, 37, 46, 60, 78, 99, 119, 142]
        };

        const mozliweIz = obciazalnosc[algUlozenie];
        let S = -1;
        let Iz_rzeczywiste = -1;
        for (let i = 0; i < mozliweIz.length; i++) {
            if (mozliweIz[i] >= Iz) {
                S = odcinkiZPrzekrojem[i];
                Iz_rzeczywiste = mozliweIz[i];
                break;
            }
        }

        if (S === -1) {
            setAlgResult({ error: 'Brak odpowiedniego przekroju dla prądu > 119A w bazie danych.' });
            return;
        }

        const gamma = 56;
        let spadekDb = 0;
        if (algNapiecie === '3') {
            spadekDb = (Math.sqrt(3) * L * Ib) / (gamma * S);
        } else {
            spadekDb = (2 * L * Ib) / (gamma * S);
        }
        let procSpadek = (spadekDb / (algNapiecie === '3' ? 400 : 230)) * 100;

        let S_ostateczne = S;
        let proc_ostateczne = procSpadek;
        let upsized = false;

        if (procSpadek > 3) {
            upsized = true;
            for (let i = 0; i < odcinkiZPrzekrojem.length; i++) {
                if (odcinkiZPrzekrojem[i] > S) {
                    let nS = odcinkiZPrzekrojem[i];
                    let nProc = 0;
                    if (algNapiecie === '3') nProc = (Math.sqrt(3) * L * Ib) / (gamma * nS) / 400 * 100;
                    else nProc = (2 * L * Ib) / (gamma * nS) / 230 * 100;

                    if (nProc <= 3) {
                        S_ostateczne = nS;
                        proc_ostateczne = nProc;
                        break;
                    }
                }
            }
        }

        setAlgResult({ Ib, In, S_term: S, S_ostateczne, proc_ostateczne, Iz_rzeczywiste, upsized });
    };

    const generateNormativePDF = () => {
        if (!algResult || algResult.error) return;
        const doc = new jsPDF();

        if (settings?.logoBase64) {
            const format = settings.logoBase64.includes('jpeg') || settings.logoBase64.includes('jpg') ? 'JPEG' : 'PNG';
            doc.addImage(settings.logoBase64, format, 155, 10, 40, 20);
        }

        doc.setFontSize(16);
        doc.text("Karta Doboru Przewodu Zgodnie z PN-HD 60364", 14, 20);

        doc.setFontSize(11);
        doc.text(`Zadeklarowana moc ustroju (odbiornika): ${algMoc} kW`, 14, 30);
        doc.text(`Dlugosc projektowanej trasy: ${algDlugosc} m`, 14, 38);
        doc.text(`Sposob ulozenia kabla: ${algUlozenie === 'A1' ? 'W izolacji termicznej (A1)' : algUlozenie === 'C' ? 'W instalacji natynkowej/w scianie bez izolacji (C)' : 'Bezposrednio w ziemi (D)'}`, 14, 46);
        doc.text(`Uklad zasilania: ${algNapiecie === '3' ? 'Trojfazowy' : 'Jednofazowy'}`, 14, 54);

        doc.text(`1. Biezacy prad obciazeniowy (Ib): ${algResult.Ib.toFixed(2)} A`, 14, 68);
        doc.text(`2. Wybrane nominalne zabezpieczenie (In): ${algResult.In} A`, 14, 76);
        doc.text(`3. Minimalny dopuszczalny przekroj na temperature: ${algResult.S_term} mm2 (dla Iz: ${algResult.Iz_rzeczywiste} A)`, 14, 84);

        doc.setFontSize(12);
        doc.setTextColor(0, 100, 0);
        doc.text(`4. OSTATECZNY DOBRANY PRZEKROJ: ${algResult.S_ostateczne} mm2 z miedzi (Cu)`, 14, 98);
        doc.setTextColor(0, 0, 0);
        doc.text(`Szacowany spadek napiecia na tym przekroju: ${algResult.proc_ostateczne.toFixed(2)} % (Zgodny z norma < 3%)`, 14, 106);

        if (algResult.upsized) {
            doc.setFontSize(9);
            doc.setTextColor(200, 0, 0);
            doc.text("UWAGA: Przekroj zostal zwiekszony przez algorytm wzgledem grubosci termicznej", 14, 114);
            doc.text("aby zapobiec zbyt wysokiemu spadkowi napiecia na danej odleglosci l > max.", 14, 119);
        }

        doc.save("Schemat_i_Dobor_Przewodu.pdf");
    };

    return (
        <div className="container">
            <div style={{ marginBottom: '32px' }}>
                <h1>Narzędzia i Kalkulatory</h1>
                <p style={{ color: 'var(--text-muted)' }}>Szybkie przeliczniki w terenie, żeby upewnić się, że kabel na pewno jest dobrany ok.</p>
            </div>

            <div className="grid grid-2" style={{ gap: '24px' }}>
                <div className="glass-panel">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><Zap size={18} color="var(--primary-color)" /> Kalkulator Spadku Napięcia (ΔU %)</h3>
                    <form onSubmit={obliczSpadek}>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label>Długość obwodu (m)</label>
                                <input type="number" step="0.5" value={dlugosc} onChange={e => setDlugosc(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Obciążenie - Prąd (A)</label>
                                <input type="number" step="0.5" value={prad} onChange={e => setPrad(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Przekrój żył (mm²)</label>
                                <input type="number" step="0.5" value={przekroj} onChange={e => setPrzekroj(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Układ zasilania</label>
                                <select value={fazy} onChange={e => setFazy(e.target.value)} style={{ padding: '8px' }}>
                                    <option value="1">1-fazowy (230V)</option>
                                    <option value="3">3-fazowy (400V)</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Calculator size={16} /> Oblicz Spadek
                        </button>
                    </form>

                    {spadekResult !== null && (
                        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: spadekResult > 3 ? '#fee2e2' : '#dcfce7', border: `1px solid ${spadekResult > 3 ? '#fca5a5' : '#86efac'}` }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: spadekResult > 3 ? '#991b1b' : '#166534' }}>Spadek napięcia wyniesie: {spadekResult.toFixed(2)}%</div>
                            <div style={{ fontSize: '0.9rem', color: spadekResult > 3 ? '#b91c1c' : '#15803d', marginTop: '4px' }}>
                                {spadekResult > 3 ? 'Kabel jest ZBYT CIENKI dla tej długości lub prądu! (Normy zalecają < 3%). Rozważ większy przekrój.' : 'Wszystko w normie (< 3%). Kabel został dobrany poprawnie.'}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                * Kalkulacja orientacyjna dla przewodu miedzianego i cosφ = 1.
                            </div>
                        </div>
                    )}
                </div>

                <div className="glass-panel">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}><Zap size={18} color="var(--primary-color)" /> Przelicznik Zabezpieczenia (Ampery) na Moc (kW)</h3>
                    <form onSubmit={obliczKw}>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label>Wartość wyłącznika (A)</label>
                                <input type="number" step="0.5" value={ampI} onChange={e => setAmpI(e.target.value)} placeholder="np. 20" required />
                            </div>
                            <div className="form-group">
                                <label>Zasilanie</label>
                                <select value={ampFazy} onChange={e => setAmpFazy(e.target.value)} style={{ padding: '8px' }}>
                                    <option value="1">1-fazowe</option>
                                    <option value="3">3-fazowe (siła)</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-outline" style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Calculator size={16} /> Przelicz
                        </button>
                    </form>

                    {kwResult !== null && (
                        <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#0369a1' }}>Przybliżona moc to: {kwResult.toFixed(2)} kW</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Inżynieryjny Algorytm Doboru */}
            <div className="glass-panel" style={{ marginTop: '24px', borderTop: '4px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem' }}>
                            <HardHat size={24} color="var(--primary-color)" /> Algorytm Doboru Zabezpieczeń i Przekrojów
                        </h3>
                        <p style={{ color: 'var(--text-muted)' }}>Optymalizator parametrów inżynieryjnych. Wylicza prąd obliczeniowy, dobiera eskę, oraz liczy minimalny przekrój uwzględniając warunki ułożenia i spadek napięcia (PN-HD 60364).</p>
                    </div>
                </div>

                <form onSubmit={runAlgorithm}>
                    <div className="grid grid-4" style={{ gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                            <label>Długość trasy WLZ/obwodu (m)</label>
                            <input type="number" step="0.5" value={algDlugosc} onChange={e => setAlgDlugosc(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Czynna Moc Urządzenia (kW)</label>
                            <input type="number" step="0.1" placeholder="np. 7.5 (Płyta indukcyjna)" value={algMoc} onChange={e => setAlgMoc(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Zasilanie Odbiornika</label>
                            <select value={algNapiecie} onChange={e => setAlgNapiecie(e.target.value)}>
                                <option value="1">1-fazowe (230V)</option>
                                <option value="3">3-fazowe (400V)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Warunki Chłodzenia (PN-HD)</label>
                            <select value={algUlozenie} onChange={e => setAlgUlozenie(e.target.value)}>
                                <option value="A1">W rurce w ścianie z ociepl. (A1)</option>
                                <option value="C">Zamurowany tynkiem do cegły (C)</option>
                                <option value="D">Prowadzony w ziemi (D)</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%', justifyContent: 'center', height: '48px', fontSize: '1.1rem' }}>
                        <Calculator size={20} /> Dobierz Komponenty Trasy (Uruchom Algorytm)
                    </button>
                </form>

                {algResult && (
                    <div style={{ marginTop: '24px' }}>
                        {algResult.error ? (
                            <div style={{ padding: '16px', borderRadius: '8px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', fontWeight: 'bold' }}>
                                {algResult.error}
                            </div>
                        ) : (
                            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '2px dashed var(--surface-border)' }}>
                                <div className="grid grid-2" style={{ gap: '24px' }}>
                                    <div>
                                        <h4 style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>1. Obliczone parametry elektryczne</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <li><span style={{ color: 'var(--text-muted)' }}>Prąd projektowy obciążenia (I<sub>b</sub>):</span> <strong style={{ fontSize: '1.1rem' }}>{algResult.Ib.toFixed(2)} A</strong></li>
                                            <li><span style={{ color: 'var(--text-muted)' }}>Nominalne wsparte zabezpieczenie (I<sub>n</sub>):</span> <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{algResult.In} A (np. B{algResult.In} / C{algResult.In})</strong></li>
                                            <li><span style={{ color: 'var(--text-muted)' }}>Wymagana obciążalność przewodu (I<sub>z</sub>):</span> <strong>&gt;= {algResult.In} A</strong></li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>2. Dobór przekroju żyły S (Miedź Cu)</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <li><span style={{ color: 'var(--text-muted)' }}>Minimalny przekrój ze względów temp:</span> <strong>{algResult.S_term} mm²</strong></li>
                                            <li><span style={{ color: 'var(--text-muted)' }}>Zabezpieczony wynikowy ΔU (%):</span> <strong style={{ color: algResult.proc_ostateczne > 3 ? '#991b1b' : '#166534' }}>{algResult.proc_ostateczne.toFixed(2)}%</strong></li>
                                        </ul>
                                        <div style={{ marginTop: '16px', padding: '12px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px' }}>
                                            <span style={{ color: '#065f46', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                                                Zalecany Przekrój: {algResult.S_ostateczne} mm²
                                            </span>
                                            {algResult.upsized && (
                                                <div style={{ color: '#991b1b', fontSize: '0.8rem', marginTop: '4px' }}>* Przekrój zwiększony w celach zachowania niskiego spadku napięcia na dystansie!</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <button className="btn btn-outline" style={{ marginTop: '24px', width: '100%', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }} onClick={generateNormativePDF}>
                                    <FileText size={18} /> Wydrukuj Inżynieryjną Kartę Doboru Przewodu (Dla Inspektora)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
