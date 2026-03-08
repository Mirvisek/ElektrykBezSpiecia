import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, AlertTriangle, PenTool, Plus, ScanLine, Printer, X } from 'lucide-react';
import Barcode from 'react-barcode';

export default function Equipment() {
    const equipment = useLiveQuery(() => db.equipment.toArray());

    const [isAdding, setIsAdding] = useState(false);
    const [model, setModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [calibrationDate, setCalibrationDate] = useState('');

    // Barcode States
    const [searchTerm, setSearchTerm] = useState('');
    const [barcodeToPrint, setBarcodeToPrint] = useState<any>(null);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!model) return;

        const barcodeNumber = 'EBS-' + Math.floor(100000 + Math.random() * 900000).toString();

        await db.equipment.add({
            model,
            serialNumber,
            calibrationDate,
            barcodeNumber
        });

        setModel(''); setSerialNumber(''); setCalibrationDate('');
        setIsAdding(false);
    };

    const getDaysDifference = (targetDate: string | undefined) => {
        if (!targetDate) return null;
        const today = new Date();
        const target = new Date(targetDate);
        const df = target.getTime() - today.getTime();
        return Math.ceil(df / (1000 * 3600 * 24));
    };

    return (
        <div className="container relative">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                    <h1>Mój Sprzęt (Park Maszynowy)</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Miernik to dokument prawny. Pilnuj dat ważności świadectwa wzorcowania.</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Dodaj sprzęt
                    </button>
                )}
            </div>

            {/* BARCODE SCANNER AREA */}
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', background: '#f8fafc', border: '2px dashed var(--surface-border)' }}>
                <ScanLine size={32} style={{ color: 'var(--primary-color)' }} />
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Skaner Kodów Kreskowych</h3>
                    <input
                        type="text"
                        autoFocus
                        placeholder="Zeskanuj narzędzie pistoletem (lub wpisz kod)..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px', fontSize: '1.1rem', border: '1px solid var(--primary-color)', borderRadius: '8px' }}
                    />
                </div>
            </div>

            {isAdding && (
                <div className="glass-panel" style={{ marginTop: '32px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3><PenTool size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Dodaj nowy miernik</h3>
                        <button className="btn btn-outline" onClick={() => setIsAdding(false)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                    </div>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label>Model miernika (np. MPI-520)</label>
                                <input type="text" value={model} onChange={e => setModel(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Numer seryjny (Opcjonalnie)</label>
                                <input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Data świadectwa wzorcowania (Opcjonalnie)</label>
                                <input type="date" value={calibrationDate} onChange={e => setCalibrationDate(e.target.value)} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Dodaj sprzęt
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Model</th>
                            <th>Nr seryjny</th>
                            <th>Ważność wzorcowania</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipment?.filter(eq => !searchTerm || eq.barcodeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || eq.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || eq.model.toLowerCase().includes(searchTerm.toLowerCase())).map(eq => {
                            const daysLeft = getDaysDifference(eq.calibrationDate);
                            const isWarning = daysLeft !== null && daysLeft <= 14;
                            const isCritical = daysLeft !== null && daysLeft <= 0;

                            return (
                                <tr key={eq.id} style={{ background: searchTerm && (eq.barcodeNumber?.toLowerCase() === searchTerm.toLowerCase()) ? '#f0fdf4' : 'transparent' }}>
                                    <td style={{ fontWeight: 600 }}>{eq.model}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <code style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }} title="Kod Kreskowy (ID)">{eq.barcodeNumber}</code>
                                            {eq.serialNumber && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SN: {eq.serialNumber}</span>}
                                        </div>
                                    </td>
                                    <td>{eq.calibrationDate || '-'}</td>
                                    <td>
                                        {daysLeft === null ? (
                                            <span style={{ color: 'var(--text-muted)' }}>Brak daty</span>
                                        ) : isCritical ? (
                                            <span style={{ color: 'var(--danger-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <AlertTriangle size={14} /> Po terminie!
                                            </span>
                                        ) : isWarning ? (
                                            <span style={{ color: '#eab308', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <AlertTriangle size={14} /> Zostało {daysLeft} dni
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--success-color)' }}>Ważne ({daysLeft} dni)</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button className="btn btn-outline" onClick={() => setBarcodeToPrint(eq)} style={{ padding: '6px', color: 'var(--primary-color)' }} title="Pokaż Kod Kreskowy">
                                                <Printer size={16} />
                                            </button>
                                            <button className="btn btn-outline" onClick={() => db.equipment.delete(eq.id!)} style={{ padding: '6px', color: 'var(--danger-color)' }} title="Usuń ze stany">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {(!equipment || equipment.length === 0) && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Brak zapisanego sprzętu. Dodaj swój pierwszy miernik.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DO WYDRUKU KODU */}
            {barcodeToPrint && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h2 style={{ fontSize: '1.25rem' }}>Etykieta Narzędzia (Kod Kreskowy)</h2>
                            <button onClick={() => setBarcodeToPrint(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '32px', background: '#fff', borderRadius: '8px', border: '1px solid var(--surface-border)', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#000' }} id="printable-barcode">
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}>{barcodeToPrint.model}</h3>
                            <Barcode value={barcodeToPrint.barcodeNumber || barcodeToPrint.serialNumber || 'BRAK'} width={2} height={80} displayValue={true} />
                        </div>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
                            Możesz wydrukować tę etykietę i nakleić na urządzenie.
                            Po zeskakowaniu pistoletem, sprzęt z automatu odnajdzie się na liście.
                        </p>

                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                            // Simple primitive print functionality for browser isolation
                            const printWindow = window.open('', '', 'height=600,width=800');
                            if (printWindow) {
                                printWindow.document.write('<html><head><title>Druk Kodu - ' + barcodeToPrint.model + '</title></head><body style="margin:0; padding:40px; display:flex; flex-direction:column; align-items:center; font-family:sans-serif; text-align:center;">');
                                printWindow.document.write('<div>' + document.getElementById('printable-barcode')?.innerHTML + '</div>');
                                printWindow.document.write('</body></html>');
                                printWindow.document.close();
                                setTimeout(() => {
                                    printWindow.print();
                                }, 500);
                            }
                        }}>
                            <Printer size={18} /> Drukuj Etykietę Kreskową
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
