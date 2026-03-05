import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Trash2, FileSignature, Download, Zap, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { pdf } from '@react-pdf/renderer';
import ProtocolPDF from '../components/ProtocolPDF';

export default function ProtocolGenerator() {
    const protocols = useLiveQuery(() => db.protocols.orderBy('date').reverse().toArray());
    const equipmentList = useLiveQuery(() => db.equipment.toArray()) || [];
    const settings = useLiveQuery(() => db.settings.get(1));

    const [isCreating, setIsCreating] = useState(false);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [objectAddress, setObjectAddress] = useState('');
    const [equipmentId, setEquipmentId] = useState<number | ''>('');
    const [notes, setNotes] = useState('Instalacja nadaje się do eksploatacji.');

    // RCD Table specific to electricians
    const [rcds, setRcds] = useState<any[]>([]);

    // Form RCD
    const [newObwod, setNewObwod] = useState('');
    const [newIn, setNewIn] = useState('30'); // mA
    const [newDelta, setNewDelta] = useState(''); // mA
    const [newTa, setNewTa] = useState(''); // ms

    const addRcd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newObwod || !newDelta || !newTa) return;
        setRcds([...rcds, {
            name: newObwod,
            In: parseFloat(newIn),
            deltaIA: parseFloat(newDelta),
            ta: parseFloat(newTa),
            result: parseFloat(newTa) <= 300 ? 'Pozytywny' : 'Negatywny' // Uproszczone dla 1x In wyłącznika klasycznego
        }]);
        setNewObwod(''); setNewDelta(''); setNewTa('');
    };

    const handleCreate = async () => {
        if (!clientName || !equipmentId || rcds.length === 0) return;

        await db.protocols.add({
            date,
            clientName,
            clientAddress,
            objectAddress: objectAddress || clientAddress,
            equipmentId: equipmentId as number,
            measurements: rcds,
            notes,
            status: 'completed'
        });

        setIsCreating(false);
        setRcds([]);
        setClientName(''); setClientAddress(''); setObjectAddress('');
    };

    const generatePdf = async (protocol: any) => {
        const eq = await db.equipment.get(protocol.equipmentId);
        const pWithEq = { ...protocol, eqModel: eq?.model || 'Brak danych', eqSerial: eq?.serialNumber || 'Brak', eqCal: eq?.calibrationDate || 'Brak' };

        const doc = <ProtocolPDF protocol={pWithEq} settings={settings} />;
        const asPdf = pdf(doc);
        const blob = await asPdf.toBlob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Protokoły Z Pomiarów</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Generuj gotowe pliki PDF z tabelami pomiarów instalacji elektrycznej od ręki na obiekcie.</p>
                </div>
                {!isCreating && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        <Plus size={18} /> Nowy Protokół (RCD)
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="glass-panel" style={{ marginBottom: '32px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3>Kreator Protokołu (Badania wyłączników różnicowoprądowych)</h3>
                        <button className="btn btn-outline" onClick={() => setIsCreating(false)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                    </div>

                    <div className="grid grid-2" style={{ gap: '16px' }}>
                        <div className="form-group">
                            <label>Zleceniodawca (Imię/Nazwisko/Firma)</label>
                            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Data wykonania pomiarów</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Adres zleceniodawcy</label>
                            <input type="text" value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="00-000 Miasto, ulica..." />
                        </div>
                        <div className="form-group">
                            <label>Obiekt / Miejsce pomiarów (zostaw puste jeśli jak wyżej)</label>
                            <input type="text" value={objectAddress} onChange={e => setObjectAddress(e.target.value)} placeholder="Budynek wielorodzinny nr 4..." />
                        </div>
                        <div className="form-group">
                            <label>Użyty miernik i przyrządy</label>
                            <select value={equipmentId} onChange={e => setEquipmentId(parseInt(e.target.value))} required style={{ padding: '8px' }}>
                                <option value="">-- Wybierz urządzenie pomiarowe z Parku Maszyn --</option>
                                {equipmentList.map(eq => (
                                    <option key={eq.id} value={eq.id}>{eq.model} (SN: {eq.serialNumber})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <h4 style={{ marginTop: '32px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--primary-color)' }}>
                        <Zap size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Tabela: Pomiary wyłącznika RCD
                    </h4>

                    <form onSubmit={addRcd} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                        <div style={{ flex: 3 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nazwa obwodu / wyłącznika</label>
                            <input type="text" value={newObwod} onChange={e => setNewObwod(e.target.value)} placeholder="np. RCD Łazienka / Q1" required style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>IΔn (mA)</label>
                            <select value={newIn} onChange={e => setNewIn(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                                <option value="30">30 mA</option>
                                <option value="100">100 mA</option>
                                <option value="300">300 mA</option>
                            </select>
                        </div>
                        <div style={{ flex: 1.5 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prąd Zadział. IΔA</label>
                            <input type="number" step="0.1" value={newDelta} onChange={e => setNewDelta(e.target.value)} required style={{ width: '100%', padding: '8px' }} placeholder="mA" />
                        </div>
                        <div style={{ flex: 1.5 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Czas tA (ms)</label>
                            <input type="number" step="0.1" value={newTa} onChange={e => setNewTa(e.target.value)} required style={{ width: '100%', padding: '8px' }} placeholder="ms" />
                        </div>
                        <button type="submit" className="btn btn-outline" style={{ height: '35px' }}>
                            <Plus size={16} /> Wstaw
                        </button>
                    </form>

                    <table className="data-table" style={{ marginBottom: '24px' }}>
                        <thead>
                            <tr>
                                <th>Lp.</th>
                                <th>Badany wyłącznik / obwód</th>
                                <th>IΔn</th>
                                <th>IΔA (mA)</th>
                                <th>tA (ms)</th>
                                <th>Wynik</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rcds.map((rcd, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{rcd.name}</td>
                                    <td>{rcd.In} mA</td>
                                    <td>{rcd.deltaIA.toFixed(1)}</td>
                                    <td>{rcd.ta.toFixed(1)}</td>
                                    <td style={{ color: rcd.result === 'Pozytywny' ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 'bold' }}> {rcd.result}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-danger" style={{ padding: '4px' }} onClick={() => { const n = [...rcds]; n.splice(idx, 1); setRcds(n); }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {rcds.length === 0 && (
                                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>Wstaw pierwszy obwód by wygenerować tabelę...</td></tr>
                            )}
                        </tbody>
                    </table>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label>Orzeczenie i końcowe wnioski</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', minHeight: '60px', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }} />
                    </div>

                    <button className="btn btn-primary" onClick={handleCreate} disabled={rcds.length === 0 || !clientName || !equipmentId} style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                        <FileSignature size={20} /> Zakończ pomiary i zapisz Protokół
                    </button>
                </div>
            )}

            <div className="grid grid-3" style={{ gap: '16px' }}>
                {protocols?.map(protocol => (
                    <div key={protocol.id} className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#1e293b' }}>{protocol.clientName}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            <Zap size={14} style={{ display: 'inline', marginRight: '4px', color: 'var(--primary-color)' }} />
                            {protocol.objectAddress}
                        </div>

                        <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Data: <strong>{protocol.date}</strong></span>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Punkty PP: <strong>{protocol.measurements.length} wyłączników</strong></span>
                            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Sprzęt uż.: <Settings size={12} style={{ display: 'inline' }} /> Id {protocol.equipmentId}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-primary" onClick={() => generatePdf(protocol)} style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '8px', gap: '4px' }}>
                                <Download size={16} /> Pobierz PDF
                            </button>
                        </div>

                        <button className="btn btn-danger" onClick={() => { if (window.confirm('Usunąć archiwum na trwałe?')) db.protocols.delete(protocol.id!); }} style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }} title="Zniszcz Dokument">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {protocols?.length === 0 && !isCreating && (
                    <div style={{ gridColumn: 'span 3', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileSignature size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <br />
                        Brak wygenerowanych protokołów rcd z obiektów.
                    </div>
                )}
            </div>
        </div>
    );
}
