import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, Archive, Package, Plus } from 'lucide-react';

export default function Inventory() {
    const inventory = useLiveQuery(() => db.inventory.toArray());

    const [isAdding, setIsAdding] = useState(false);
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('szt.');
    const [minQuantity, setMinQuantity] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || quantity === '') return;

        await db.inventory.add({
            name,
            quantity: parseFloat(quantity),
            unit,
            minQuantity: minQuantity ? parseFloat(minQuantity) : undefined
        });

        setName(''); setQuantity(''); setUnit('szt.'); setMinQuantity('');
        setIsAdding(false);
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Magazyn Materiałów</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Stan paki w samochodzie – wiesz, ile kabla 3x2,5 na zapasie, ile esek B16, a co trzeba dokupić.</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Dodaj materiał
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="glass-panel" style={{ marginTop: '32px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3><Package size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Nowy artykuł w magazynie / na aucie</h3>
                        <button className="btn btn-outline" onClick={() => setIsAdding(false)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                    </div>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label>Nazwa towaru (np. ES B16, Przewód YDY, Gniazdo)</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 2 }}>
                                    <label>Aktualna ilość</label>
                                    <input type="number" step="0.5" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Jedn. miary</label>
                                    <input type="text" value={unit} onChange={e => setUnit(e.target.value)} placeholder="szt. / m" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Próg minimalny (Ostrzegaj poniżej zapasu)</label>
                                <input type="number" step="0.5" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} placeholder="np. 5 (sztuk)" />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Dodaj zasób
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ marginTop: '32px', padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Artykuł</th>
                            <th style={{ textAlign: 'center' }}>Stan</th>
                            <th>Jednostka</th>
                            <th>Status Rezerwy</th>
                            <th style={{ textAlign: 'center' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory?.map(item => {
                            const isLow = item.minQuantity && item.quantity <= item.minQuantity;
                            return (
                                <tr key={item.id} style={{ background: isLow ? '#fef2f2' : 'inherit' }}>
                                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                                    <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        {item.quantity}
                                    </td>
                                    <td>{item.unit}</td>
                                    <td>
                                        {isLow ? (
                                            <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>
                                                Zapas wyczerpany! ({item.quantity} z min. {item.minQuantity})
                                            </span>
                                        ) : (
                                            item.minQuantity ? <span style={{ color: 'var(--success-color)' }}>Wystarczający</span> : '-'
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button className="btn btn-outline" onClick={() => {
                                            const val = window.prompt(`Zmień nakład dla ${item.name} (${item.unit})`, item.quantity.toString());
                                            if (val !== null && !isNaN(parseFloat(val))) {
                                                db.inventory.update(item.id!, { quantity: parseFloat(val) });
                                            }
                                        }} style={{ padding: '6px' }} title="Zmień ilość">
                                            <Archive size={16} /> Edit
                                        </button>
                                        <button className="btn btn-danger" onClick={() => db.inventory.delete(item.id!)} style={{ padding: '6px' }} title="Usuń towar">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {(!inventory || inventory.length === 0) && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Brak materiałów. Pusto na pace uziemionej, wszystko popyte! Dodaj swoje zapasy.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
