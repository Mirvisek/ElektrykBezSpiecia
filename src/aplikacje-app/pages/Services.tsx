import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Briefcase, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export default function Services() {
    const services = useLiveQuery(() => db.services.toArray());

    const [sName, setSName] = useState('');
    const [sPrice, setSPrice] = useState('');

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editPrice, setEditPrice] = useState('');

    const addService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sName || !sPrice) return;
        await db.services.add({ name: sName, defaultPrice: parseFloat(sPrice) });
        setSName(''); setSPrice('');
        setIsAdding(false);
    };

    const startEdit = (id: number, currentName: string, currentPrice: number) => {
        setEditingId(id);
        setEditName(currentName);
        setEditPrice(currentPrice.toString());
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditPrice('');
    };

    const saveEdit = async (id: number) => {
        if (!editName || !editPrice) return;
        await db.services.update(id, { name: editName, defaultPrice: parseFloat(editPrice) });
        setEditingId(null);
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Cennik Usług</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Stałe pule usług wspierające szybsze generowanie rachunków.</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Dodaj usługę
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="glass-panel" style={{ marginTop: '32px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3><Plus size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Dodaj nową usługę</h3>
                        <button className="btn btn-outline" onClick={() => setIsAdding(false)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                    </div>
                    <form onSubmit={addService}>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label>Nazwa usługi</label>
                                <input type="text" placeholder="np. Wymiana rozdzielnicy..." value={sName} onChange={e => setSName(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Domyślna cena brutto (zł)</label>
                                <input type="number" step="0.01" placeholder="350.00" value={sPrice} onChange={e => setSPrice(e.target.value)} required />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            <Plus size={16} /> Dodaj Usługę
                        </button>
                    </form>
                </div>
            )}

            <div style={{ marginTop: '32px' }}>
                <div className="glass-panel">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Briefcase size={24} color="var(--primary-color)" /> Twój Cennik Usług
                    </h2>
                    <div style={{ marginTop: '24px' }}>
                        {services?.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Brak zdefiniowanych usług.</p>}
                        {services?.map((s, index) => (
                            <div key={s.id} style={{ padding: '16px', marginBottom: '12px', background: '#f9fafb', border: '1px solid var(--surface-border)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: 600, marginRight: '16px', color: 'var(--text-muted)' }}>#{index + 1}</div>
                                {editingId === s.id ? (
                                    <div style={{ flex: 1, display: 'flex', gap: '8px', marginRight: '16px' }}>
                                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} style={{ flex: 2, padding: '4px 8px' }} />
                                        <input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ flex: 1, padding: '4px 8px' }} />
                                    </div>
                                ) : (
                                    <div style={{ fontWeight: 600, color: '#111827', flex: 1 }}>{s.name}</div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {editingId === s.id ? (
                                        <>
                                            <button className="btn btn-primary" onClick={() => saveEdit(s.id!)} style={{ padding: '6px' }} title="Zapisz">
                                                <Check size={16} />
                                            </button>
                                            <button className="btn btn-outline" onClick={cancelEdit} style={{ padding: '6px' }} title="Anuluj">
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: '4px', fontWeight: 700, whiteSpace: 'nowrap', marginRight: '8px' }}>
                                                {parseFloat(s.defaultPrice.toString()).toFixed(2)} zł
                                            </div>
                                            <button className="btn btn-outline" onClick={() => startEdit(s.id!, s.name, s.defaultPrice)} style={{ padding: '8px' }} title="Edytuj">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn btn-danger" onClick={() => db.services.delete(s.id!)} style={{ padding: '8px' }} title="Usuń">
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
