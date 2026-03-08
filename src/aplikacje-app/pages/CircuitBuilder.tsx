import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, X, User, Printer, Trash2, ShieldAlert, FileText, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CircuitBuilder() {
    const clients = useLiveQuery(() => db.clients.toArray());
    const circuits = useLiveQuery(() => db.circuits.toArray());
    const settings = useLiveQuery(() => db.settings.get(1));

    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');

    const [symbol, setSymbol] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState('MCB');
    const [rating, setRating] = useState('B16');
    const [cable, setCable] = useState('3x2.5');

    const filteredCircuits = useMemo(() => {
        let items = circuits || [];
        if (selectedClientId !== '') {
            items = items.filter(c => c.clientId === selectedClientId);
        }
        return items.sort((a, b) => a.symbol.localeCompare(b.symbol, undefined, { numeric: true }));
    }, [circuits, selectedClientId]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClientId === '') return alert('Najpierw wybierz inwestycję (klienta)');

        await db.circuits.add({
            clientId: Number(selectedClientId),
            symbol,
            name,
            type,
            rating,
            cable
        });

        // Auto increment symbol if it's like F1 -> F2
        const match = symbol.match(/^([a-zA-Z]+)(\d+)$/);
        if (match) {
            setSymbol(`${match[1]}${parseInt(match[2]) + 1}`);
        } else {
            setSymbol('');
        }
        setName('');
    };

    const deleteCircuit = async (id: number) => {
        await db.circuits.delete(id);
    };

    const generatePDF = () => {
        if (filteredCircuits.length === 0) return alert('Brak obwodów do wygenerowania.');

        const doc = new jsPDF();
        const client = clients?.find(c => c.id === selectedClientId);
        const title = `Legenda Rozdzielnicy - ${client?.name || 'Obiekt'}`;

        let currentY = 35;

        if (settings?.logoBase64) {
            const format = settings.logoBase64.includes('jpeg') || settings.logoBase64.includes('jpg') ? 'JPEG' : 'PNG';
            doc.addImage(settings.logoBase64, format, 14, 10, 40, 20);
            doc.setFontSize(16);
            doc.text(title, 14, 40);
            doc.setFontSize(10);
            doc.text('Tabelę możesz wsunąć w kieszonkę w drzwiach rozdzielnicy (lub wydrukować na naklejce).', 14, 48);
            currentY = 55;
        } else {
            doc.setFontSize(16);
            doc.text(title, 14, 20);
            doc.setFontSize(10);
            doc.text('Tabelę możesz wsunąć w kieszonkę w drzwiach rozdzielnicy (lub wydrukować na naklejce).', 14, 28);
        }

        const tableData = filteredCircuits.map(c => [
            c.symbol,
            c.name,
            c.type,
            c.rating,
            c.cable
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [['Oznaczenie', 'Zasilany Obwód', 'Aparat', 'Prąd Znamionowy', 'Przewód']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: 255 },
            styles: { fontSize: 9 },
        });

        doc.save(`Rozdzielnica_${client?.name || 'DOM'}.pdf`);
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1>Opisy do Rozdzielnic (Drukarka)</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Zbuduj i wydrukuj profesjonalną legendę obwodów na drzwiczki skrzynki rozdzielczej.</p>
                </div>
                {selectedClientId !== '' && (
                    <button className="btn btn-primary" onClick={generatePDF} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <Printer size={18} /> Drukuj do PDF
                    </button>
                )}
            </div>

            <div className="glass-panel" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <User size={20} color="var(--text-muted)" />
                <select
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: '#fff' }}
                >
                    <option value="">-- Wybierz Obiekt Inwestycji --</option>
                    {clients?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {selectedClientId !== '' ? (
                <div className="grid grid-2" style={{ gap: '24px', alignItems: 'start' }}>
                    {/* Kreator Obwodu */}
                    <div className="glass-panel" style={{ borderTop: '4px solid var(--primary-color)' }}>
                        <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0' }}>
                            <Plus size={18} color="var(--primary-color)" /> Dodaj Aparat / Obwód
                        </h3>
                        <form onSubmit={handleAdd}>
                            <div className="grid grid-2" style={{ gap: '12px', marginBottom: '12px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Oznaczenie (np. F1)</label>
                                    <input type="text" required value={symbol} onChange={e => setSymbol(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Cel (np. Gniazda Salon)</label>
                                    <input type="text" required value={name} onChange={e => setName(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid grid-3" style={{ gap: '12px', marginBottom: '16px' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Typ Aparatu</label>
                                    <select value={type} onChange={e => setType(e.target.value)}>
                                        <option value="MCB">MCB (Wył. Nadpr.)</option>
                                        <option value="RCD">RCD (Różnicówka)</option>
                                        <option value="RCBO">RCBO (Różn. z Nadpr.)</option>
                                        <option value="SPD">SPD (Ochronnik)</option>
                                        <option value="Rozłącznik">Rozłącznik Izol.</option>
                                        <option value="Inne">Inne / Stycznik</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Nominał</label>
                                    <input type="text" placeholder="B16 / 40A 30mA" value={rating} onChange={e => setRating(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Przewód</label>
                                    <input type="text" placeholder="3x2.5" value={cable} onChange={e => setCable(e.target.value)} />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-outline" style={{ width: '100%' }}>
                                <Plus size={16} /> Wstaw do rozdzielnicy
                            </button>
                        </form>
                    </div>

                    {/* Podgląd Tabeli */}
                    <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ background: '#0A1C3B', color: 'white', padding: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                            <ShieldAlert size={18} className="text-brand-orange" /> Podgląd legendy dla elektryka
                        </div>

                        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                            <table className="data-table" style={{ margin: 0 }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>Symbol</th>
                                        <th>Opis Obwodu</th>
                                        <th>Zabezpieczenie</th>
                                        <th style={{ width: '50px' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCircuits.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                                                Skrzynka jest pusta. Dodaj pierwszy obwód.
                                            </td>
                                        </tr>
                                    )}
                                    {filteredCircuits.map(c => (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 'bold' }}>{c.symbol}</td>
                                            <td>
                                                <div style={{ color: 'var(--text-main)' }}>{c.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Przewód: {c.cable}</div>
                                            </td>
                                            <td>
                                                <span className="badge badge-blue">{c.type}</span> {c.rating && <strong>{c.rating}</strong>}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button onClick={() => deleteCircuit(c.id!)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '64px', background: '#f9fafb', border: '2px dashed var(--surface-border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                    <FileText size={48} style={{ opacity: 0.2, marginBottom: '16px', display: 'inline-block' }} />
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '8px' }}>Wybierz projekt z góry</h2>
                    <p>Aby zacząć tworzyć schematy lub opisy rozdzielnic, wskaż realizację.</p>
                </div>
            )}
        </div>
    );
}
