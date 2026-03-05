import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Trash2, Calendar, User, AlignLeft, Hash, DollarSign, Search, FileDown, ArrowUpDown, CreditCard, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '../components/InvoicePDF';
import { saveAs } from 'file-saver';

export default function SalesList() {
    const settings = useLiveQuery(() => db.settings.get(1));
    const sales = useLiveQuery(() => db.sales.toArray());
    const clients = useLiveQuery(() => db.clients.toArray());
    const services = useLiveQuery(() => db.services.toArray());

    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [execDate, setExecDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [docNumber, setDocNumber] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientData, setClientData] = useState('');
    const [items, setItems] = useState<{ id: string; name: string; amount: string }[]>([
        { id: Math.random().toString(36), name: '', amount: '' }
    ]);
    const [paymentMethod, setPaymentMethod] = useState('Gotówka');
    const [paymentDays, setPaymentDays] = useState('7');
    const [discount, setDiscount] = useState('0');
    const [isGenerating, setIsGenerating] = useState<string | null>(null);

    const salesThisMonth = useLiveQuery(() =>
        db.sales
            .where('date')
            .between(`${date.substring(0, 8)}01`, `${date.substring(0, 8)}31`, true, true)
            .toArray()
        , [date]);

    useEffect(() => {
        if (salesThisMonth !== undefined) {
            setDocNumber(`${salesThisMonth.length + 1}/${date.substring(5, 7)}/${date.substring(0, 4)}`);
        }
    }, [salesThisMonth, date]);

    const handleAdd = async (e: React.FormEvent, generatePdf: boolean = false) => {
        e.preventDefault();

        const validItems = items.filter(i => i.name.trim() !== '' && i.amount !== '');
        if (!date || !clientName || !docNumber || validItems.length === 0) {
            alert('Wypełnij wszystkie wymagane pola (Data, Klient, Numer, Usługa, Kwota).');
            return;
        }

        const calculatedServiceName = validItems.map(i => i.name).join(', ');
        const baseAmount = validItems.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
        const discountValue = parseFloat(discount) || 0;
        const calculatedAmount = discountValue > 0 ? baseAmount * (1 - discountValue / 100) : baseAmount;

        // Weryfikacja unikalności numeru
        const existingCount = await db.sales.where('documentNumber').equals(docNumber).count();
        if (existingCount > 0) {
            alert(`Błąd: Dokument o numerze ${docNumber} już istnieje w ewidencji! Zmień numer lub sprawdź listę.`);
            return;
        }

        if (generatePdf) {
            setIsGenerating('new');
        }

        try {
            await db.sales.add({
                date,
                documentNumber: docNumber,
                clientName,
                clientData,
                serviceName: calculatedServiceName,
                amount: calculatedAmount,
                execDate,
                paymentMethod,
                paymentDays,
                discount: parseFloat(discount) || 0,
                items: validItems.map(i => ({ name: i.name, quantity: 1, price: parseFloat(i.amount) || 0, total: parseFloat(i.amount) || 0 }))
            });

            if (generatePdf) {
                const currentData = {
                    issueDate: date,
                    execDate: execDate,
                    docNumber,
                    clientName,
                    clientData,
                    serviceName: calculatedServiceName,
                    paymentMethod: paymentMethod,
                    paymentDays: paymentDays,
                    amount: calculatedAmount.toFixed(2),
                    discount: parseFloat(discount) || 0,
                    items: validItems.map(item => ({ ...item, quantity: 1, total: parseFloat(item.amount) }))
                };
                const blob = await pdf(<InvoicePDF data={currentData} settings={settings} />).toBlob();
                saveAs(blob, `Rachunek_${docNumber.replace(/\//g, '_')}.pdf`);
            }

            setClientData('');
            setItems([{ id: Math.random().toString(36), name: '', amount: '' }]);
            setDiscount('0');
            // Force re-evaluation of docNumber
            setDocNumber('');
        } catch (error: any) {
            console.error('Save/PDF Error', error);
            alert(`Wystąpił błąd podczas pobierania rachunku: ${error.message || 'Nieznany błąd'}`);
        } finally {
            setIsGenerating(null);
        }
    };

    const handleGeneratePdf = async (sale: any) => {
        setIsGenerating(sale.id.toString());
        try {
            const currentData = {
                issueDate: sale.date,
                execDate: sale.execDate || sale.date,
                docNumber: sale.documentNumber,
                clientName: sale.clientName,
                clientData: sale.clientData || '',
                serviceName: sale.serviceName,
                paymentMethod: sale.paymentMethod || 'Gotówka',
                paymentDays: sale.paymentDays || '7',
                amount: sale.amount.toFixed(2),
                discount: sale.discount || 0,
                items: sale.items?.map((item: any) => ({ ...item, quantity: 1, total: parseFloat(item.amount) })) || []
            };
            const blob = await pdf(<InvoicePDF data={currentData} settings={settings} />).toBlob();
            saveAs(blob, `Rachunek_${sale.documentNumber.replace(/\//g, '_')}.pdf`);
        } catch (error: any) {
            console.error('PDF generation error', error);
            alert(`Błąd podczas generowania rachunku: ${error.message || 'Nieznany błąd'}`);
        } finally {
            setIsGenerating(null);
        }
    };

    const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = clients?.find(cl => cl.name === e.target.value);
        if (c) {
            setClientName(c.name);
            setClientData(`${c.address}\nNIP: ${c.taxId}`);
        } else {
            setClientName(e.target.value);
        }
    };

    const handleAddItem = () => {
        setItems(prev => [...prev, { id: Math.random().toString(36), name: '', amount: '' }]);
    };

    const handleRemoveItem = (id: string) => {
        if (items.length > 1) {
            setItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleItemChange = (id: string, field: 'name' | 'amount', value: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleItemServiceSelect = (id: string, value: string) => {
        const s = services?.find(sv => sv.name === value);
        if (s) {
            setItems(prev => prev.map(item => item.id === id ? { ...item, name: s.name, amount: s.defaultPrice.toString() } : item));
        } else {
            setItems(prev => prev.map(item => item.id === id ? { ...item, name: value } : item));
        }
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [sortDesc, setSortDesc] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    const filteredSales = (sales || [])
        .filter(s => {
            if (filterDateFrom && s.date < filterDateFrom) return false;
            if (filterDateTo && s.date > filterDateTo) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                if (!s.clientName?.toLowerCase().includes(term) && !s.documentNumber?.toLowerCase().includes(term) && !s.serviceName?.toLowerCase().includes(term)) {
                    return false;
                }
            }
            return true;
        })
        .sort((a, b) => {
            if (sortDesc) return a.date > b.date ? -1 : 1;
            return a.date > b.date ? 1 : -1;
        });

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Ewidencja Sprzedaży / Rachunki</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Dodawaj wpisy do ewidencji i natychmiast generuj swoje rachunki.</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Dodaj rachunek
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="glass-panel" style={{ marginTop: '32px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3><Plus size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Dodaj rachunek i wpis</h3>
                        <button className="btn btn-outline" onClick={() => setIsAdding(false)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                    </div>
                    <form onSubmit={e => handleAdd(e, false)}>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label><Calendar size={14} /> Data wystawienia (księgowania)</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label><Calendar size={14} /> Data wykonania usługi</label>
                                <input type="date" value={execDate} onChange={e => setExecDate(e.target.value)} required />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label><Hash size={14} /> Numer dokumentu np. Rachunek 1/2026</label>
                            <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} required />
                        </div>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label><User size={14} /> Klient (wybierz z bazy lub wpisz)</label>
                                <select onChange={handleClientSelect} value={clientName} style={{ marginBottom: '8px' }}>
                                    <option value="">Wybierz...</option>
                                    {clients?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                                <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nazwa klienta" required />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ marginBottom: 0 }}><AlignLeft size={14} /> Usługi na rachunku</label>
                                </div>
                                {items.map((item) => (
                                    <div key={item.id} className="grid grid-2" style={{ gap: '16px', marginBottom: '8px', alignItems: 'end' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <select onChange={e => handleItemServiceSelect(item.id, e.target.value)} value={item.name} style={{ flex: 1, padding: '8px' }}>
                                                    <option value="">Wybierz...</option>
                                                    {services?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                                </select>
                                            </div>
                                            <input type="text" value={item.name} onChange={e => handleItemChange(item.id, 'name', e.target.value)} placeholder="np. Pomiary okresowe" required />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Kwota</div>
                                                <input type="number" step="0.01" value={item.amount} onChange={e => handleItemChange(item.id, 'amount', e.target.value)} required placeholder="Kwota" />
                                            </div>
                                            {items.length > 1 && (
                                                <button type="button" className="btn btn-danger" onClick={() => handleRemoveItem(item.id)} style={{ padding: '8px', height: '38px', marginTop: '18px' }} title="Usuń usługę z rachunku">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn btn-outline" onClick={handleAddItem} style={{ marginTop: '8px', padding: '6px 12px', fontSize: '0.9rem' }}>
                                    <Plus size={14} /> Dodaj kolejną usługę
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <div className="grid grid-2" style={{ gap: '16px', background: 'var(--surface-color)', padding: '16px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label><Percent size={14} /> Rabat na całość (%)</label>
                                        <input type="number" min="0" max="100" step="1" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label><DollarSign size={14} /> Suma brutto do zapłaty</label>
                                        <div style={{ padding: '8px 12px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 'bold', fontSize: '1.2em', color: 'var(--primary-color)' }}>
                                            {(
                                                items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0) *
                                                (1 - (parseFloat(discount) || 0) / 100)
                                            ).toFixed(2)} zł
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <div className="grid grid-2" style={{ gap: '16px' }}>
                                    <div className="form-group">
                                        <label><CreditCard size={14} /> Metoda Płatności</label>
                                        <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                            <option value="Gotówka">Gotówka</option>
                                            <option value="Przelew">Przelew</option>
                                            <option value="Przedpłata">Przedpłata (zapłacone z góry)</option>
                                        </select>
                                    </div>
                                    {paymentMethod === 'Przelew' && (
                                        <div className="form-group">
                                            <label>Termin (dni)</label>
                                            <input type="number" value={paymentDays} onChange={e => setPaymentDays(e.target.value)} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button type="submit" className="btn btn-outline" disabled={isGenerating !== null}>Zapisz tylko w ewidencji</button>
                            <button type="button" className="btn btn-primary" onClick={e => handleAdd(e, true)} disabled={isGenerating !== null}>
                                <FileDown size={16} /> {isGenerating === 'new' ? 'Generowanie PDF...' : 'Zapisz i pobierz Rachunek PDF'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-panel" style={{ marginTop: '32px', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--surface-border)', background: '#f9fafb' }}>
                    <div className="grid grid-2" style={{ gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Szukaj (klient, nr dokumentu, usługa)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '36px', background: '#fff', width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} title="Data od" style={{ flex: 1 }} />
                            <span>-</span>
                            <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="Data do" style={{ flex: 1 }} />
                            <button className="btn btn-outline" onClick={() => setSortDesc(!sortDesc)} title="Sortuj po dacie" style={{ padding: '8px' }}>
                                <ArrowUpDown size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Numer</th>
                            <th>Klient</th>
                            <th>Usługa</th>
                            <th style={{ textAlign: 'right' }}>Kwota</th>
                            <th style={{ textAlign: 'center' }}>Akcja</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map(sale => (
                            <tr key={sale.id}>
                                <td>{sale.date}</td>
                                <td><span style={{ fontWeight: 600 }}>{sale.documentNumber}</span></td>
                                <td>
                                    <div>{sale.clientName}</div>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{sale.serviceName}</td>
                                <td style={{ textAlign: 'right', fontWeight: 600, color: '#111827' }}>{sale.amount.toFixed(2)} zł</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button onClick={() => handleGeneratePdf(sale)} className="btn btn-outline" style={{ padding: '6px 12px', marginRight: '8px' }} title="Pobierz rachunek PDF" disabled={isGenerating !== null}>
                                        <FileDown size={14} /> {isGenerating === sale.id?.toString() ? '...' : 'Pdf'}
                                    </button>
                                    <button onClick={() => db.sales.delete(sale.id!)} className="btn btn-danger" style={{ padding: '6px 8px' }} title="Usuń z ewidencji">
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSales.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Brak wpisów w ewidencji sprzedaży.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
