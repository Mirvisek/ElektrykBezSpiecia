import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, Calendar, FileText, DollarSign, Plus, Paperclip } from 'lucide-react';
import { format } from 'date-fns';

export default function Expenses() {
    const expenses = useLiveQuery(() => db.expenses.orderBy('date').reverse().toArray());

    const [isAdding, setIsAdding] = useState(false);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [docNum, setDocNum] = useState('');
    const [attachment, setAttachment] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachment(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !title || !amount) return;

        await db.expenses.add({
            date,
            documentNumber: docNum,
            title,
            description: desc,
            amount: parseFloat(amount),
            attachment
        });

        setDate(format(new Date(), 'yyyy-MM-dd'));
        setDesc(''); setAmount(''); setDocNum(''); setTitle(''); setAttachment('');
        setIsAdding(false);
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Rejestr Kosztów</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Mimo że podatek od działalności nierejestrowanej liczysz od przychodu, warto posiadać koszty.<br />Gdy przekroczysz limit lub w rocznym PIT-36 Twoje koszty mogą obniżyć Twój podatek.</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Dodaj koszt
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="glass-panel" style={{ marginTop: '32px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3><Plus size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Dodaj Fakturę Kosztową</h3>
                        <button className="btn btn-outline" onClick={() => setIsAdding(false)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                    </div>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label><Calendar size={14} /> Data zapłaty/faktury</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label><FileText size={14} /> Numer faktury / paragonu</label>
                                <input type="text" value={docNum} onChange={e => setDocNum(e.target.value)} placeholder="np. F/123/2026" />
                            </div>
                            <div className="form-group">
                                <label><FileText size={14} /> Tytuł kosztu</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tytuł, np. Miernik napięcia..." required />
                            </div>
                            <div className="form-group">
                                <label><FileText size={14} /> Opis kosztu (opcjonalnie)</label>
                                <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Dodatkowy opis..." />
                            </div>
                            <div className="form-group">
                                <label><DollarSign size={14} /> Kwota brutto (zł)</label>
                                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label><Paperclip size={14} /> Załącznik (PDF / Zdjęcie)</label>
                                <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            <Plus size={16} /> Dodaj Koszt
                        </button>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ marginTop: '32px', padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Nr dokumentu</th>
                            <th>Tytuł kosztu</th>
                            <th>Opis</th>
                            <th style={{ textAlign: 'center' }}>Załącznik</th>
                            <th style={{ textAlign: 'right' }}>Kwota</th>
                            <th style={{ textAlign: 'center' }}>Akcje</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses?.map(exp => (
                            <tr key={exp.id}>
                                <td>{exp.date}</td>
                                <td>{exp.documentNumber || '-'}</td>
                                <td style={{ fontWeight: typeof exp.title !== 'undefined' ? 600 : 400 }}>{exp.title || '-'}</td>
                                <td>{exp.description || '-'}</td>
                                <td style={{ textAlign: 'center' }}>
                                    {exp.attachment ? (
                                        <a href={exp.attachment} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                                            Podgląd
                                        </a>
                                    ) : (
                                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                                    )}
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--danger-color)' }}>-{exp.amount.toFixed(2)} zł</td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="btn btn-danger" onClick={() => db.expenses.delete(exp.id!)} style={{ padding: '6px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {(!expenses || expenses.length === 0) && (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Brak zaksięgowanych kosztów.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
