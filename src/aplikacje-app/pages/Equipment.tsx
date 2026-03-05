import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, AlertTriangle, PenTool, Plus } from 'lucide-react';

export default function Equipment() {
    const equipment = useLiveQuery(() => db.equipment.toArray());

    const [isAdding, setIsAdding] = useState(false);
    const [model, setModel] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [calibrationDate, setCalibrationDate] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!model || !serialNumber || !calibrationDate) return;

        await db.equipment.add({
            model,
            serialNumber,
            calibrationDate
        });

        setModel(''); setSerialNumber(''); setCalibrationDate('');
        setIsAdding(false);
    };

    const getDaysDifference = (targetDate: string) => {
        const today = new Date();
        const target = new Date(targetDate);
        const df = target.getTime() - today.getTime();
        return Math.ceil(df / (1000 * 3600 * 24));
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                <label>Numer seryjny</label>
                                <input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Data ważności świadectwa wzorcowania</label>
                                <input type="date" value={calibrationDate} onChange={e => setCalibrationDate(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Dodaj sprzęt
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ marginTop: '32px', padding: 0, overflow: 'hidden' }}>
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
                        {equipment?.map(eq => {
                            const daysLeft = getDaysDifference(eq.calibrationDate);
                            const isWarning = daysLeft <= 14;
                            const isCritical = daysLeft <= 0;

                            return (
                                <tr key={eq.id}>
                                    <td style={{ fontWeight: 600 }}>{eq.model}</td>
                                    <td>{eq.serialNumber}</td>
                                    <td>{eq.calibrationDate}</td>
                                    <td>
                                        {isCritical ? (
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
                                        <button className="btn btn-danger" onClick={() => db.equipment.delete(eq.id!)} style={{ padding: '6px' }}>
                                            <Trash2 size={16} />
                                        </button>
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
        </div>
    );
}
