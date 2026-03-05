import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, Car, Plus, AlertTriangle, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function Mileage() {
    const mileage = useLiveQuery(() => db.mileage.orderBy('date').reverse().toArray());

    const [isAdding, setIsAdding] = useState(false);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [clientName, setClientName] = useState('');
    const [distance, setDistance] = useState('');
    const [ratePerKm, setRatePerKm] = useState('1.15'); // 1.15 zł is typical amortisation

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !clientName || !distance || !ratePerKm) return;

        const d = parseFloat(distance);
        const r = parseFloat(ratePerKm);

        await db.mileage.add({
            date,
            clientName,
            distance: d,
            ratePerKm: r,
            totalCost: d * r
        });

        setDate(format(new Date(), 'yyyy-MM-dd'));
        setClientName(''); setDistance('');
        setIsAdding(false);
    };

    const totalDistance = mileage?.reduce((sum, m) => sum + m.distance, 0) || 0;
    const totalAmortization = mileage?.reduce((sum, m) => sum + m.totalCost, 0) || 0;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Kilometrówka & Dojazdy</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Obliczaj i ewidencjonuj koszty Twoich podróży służbowych i upewnij się, że nie dopłacasz do interesu.</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Rejestruj trasę
                    </button>
                )}
            </div>

            <div className="grid grid-2" style={{ gap: '16px', marginTop: '32px' }}>
                <div style={{ background: '#dbeafe', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', color: '#1e40af' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Przejechano łącznie (km)</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalDistance.toFixed(1)} km</div>
                </div>
                <div style={{ background: '#fce7f3', border: '1px solid #fbcfe8', padding: '16px', borderRadius: '8px', color: '#be185d' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Ukryty koszt amortyzacji</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{totalAmortization.toFixed(2)} zł</div>
                </div>
            </div>

            {isAdding && (
                <div className="glass-panel" style={{ marginTop: '32px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3><Car size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Nowy przejazd</h3>
                        <button className="btn btn-outline" onClick={() => setIsAdding(false)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                    </div>

                    <div style={{ background: '#fffbeb', color: '#92400e', padding: '12px', borderRadius: '6px', marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem' }}>
                        <AlertTriangle size={16} /> Podana kwota kosztu za km obejmuje nie tylko paliwo, ale też zużycie opon, oleju i wartość Twojego czasu.
                    </div>

                    <form onSubmit={handleAdd}>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label>Data wyjazdu</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> Cel (np. Klient Jan Kowalski)</label>
                                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Przejechany dystans (obie strony km)</label>
                                <input type="number" step="0.1" value={distance} onChange={e => setDistance(e.target.value)} placeholder="np. 45" required />
                            </div>
                            <div className="form-group">
                                <label>Stawka amortyzacji (zł/km)</label>
                                <input type="number" step="0.01" value={ratePerKm} onChange={e => setRatePerKm(e.target.value)} required />
                            </div>
                        </div>

                        {distance && ratePerKm && (
                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', marginTop: '16px', fontWeight: 'bold' }}>
                                Szacowany koszt całkowity tej trasy: <span style={{ color: 'var(--danger-color)' }}>{(parseFloat(distance) * parseFloat(ratePerKm)).toFixed(2)} zł</span> (Musisz doliczyć to do ceny usługi!)
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            <Plus size={16} /> Zapisz w historii przejazdów
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ marginTop: '32px', padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Cel Wyjazdu / Klient</th>
                            <th style={{ textAlign: 'center' }}>Dystans (km)</th>
                            <th style={{ textAlign: 'center' }}>Stawka za km</th>
                            <th style={{ textAlign: 'right' }}>Całkowity Koszt Wyjazdu</th>
                            <th style={{ textAlign: 'center' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mileage?.map(m => (
                            <tr key={m.id}>
                                <td>{m.date}</td>
                                <td style={{ fontWeight: 600 }}>{m.clientName}</td>
                                <td style={{ textAlign: 'center' }}>{m.distance} km</td>
                                <td style={{ textAlign: 'center' }}>{m.ratePerKm.toFixed(2)} zł</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--danger-color)' }}>
                                    -{m.totalCost.toFixed(2)} zł
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="btn btn-danger" onClick={() => db.mileage.delete(m.id!)} style={{ padding: '6px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {(!mileage || mileage.length === 0) && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Żadna podróż nie została jeszcze wpisana. Paliwo kosztuje, wyliczaj i doliczaj trasy do usług!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
