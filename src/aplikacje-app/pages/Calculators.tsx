import React, { useState } from 'react';
import { Calculator, Zap } from 'lucide-react';

export default function Calculators() {
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
        </div>
    );
}
