import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Trash2, FileText, FileDown, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { pdf } from '@react-pdf/renderer';
import QuotePDF from '../components/QuotePDF';

export default function Quotes() {
    const quotes = useLiveQuery(() => db.quotes.orderBy('date').reverse().toArray());
    const settings = useLiveQuery(() => db.settings.get(1));
    const itemsList = useLiveQuery(() => db.services.toArray()) || [];
    const invList = useLiveQuery(() => db.inventory.toArray()) || [];

    const [isCreating, setIsCreating] = useState(false);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [docNum, setDocNum] = useState(`O/${format(new Date(), 'MM/yyyy')}`);
    const [clientName, setClientName] = useState('');
    const [clientData, setClientData] = useState('');
    const [items, setItems] = useState<any[]>([]);

    // Form fields for items
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState('1');
    const [newItemPrice, setNewItemPrice] = useState('');

    const addItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || !newItemPrice || !newItemQty) return;
        const price = parseFloat(newItemPrice.replace(',', '.'));
        const qty = parseFloat(newItemQty);
        setItems([...items, { name: newItemName, quantity: qty, price: price, total: price * qty }]);
        setNewItemName(''); setNewItemPrice(''); setNewItemQty('1');
    };

    const handleCreate = async () => {
        if (!clientName || items.length === 0) return;
        const amount = items.reduce((sum, i) => sum + i.total, 0);

        await db.quotes.add({
            date,
            documentNumber: docNum,
            clientName,
            clientData,
            items,
            amount,
            status: 'draft',
            notes: 'Oferta ważna 14 dni od daty wystawienia.',
        });

        setIsCreating(false);
        setItems([]);
        setClientName(''); setClientData('');
    };

    const generatePdf = async (quote: any) => {
        const doc = <QuotePDF quote={quote} settings={settings} />;
        const asPdf = pdf(doc);
        const blob = await asPdf.toBlob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    return (
        <div className="container" style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Kosztorysy i Oferty</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Wyceniaj prace przed realizacją w profesjonalny sposób.</p>
                </div>
                {!isCreating && (
                    <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        <Plus size={18} /> Nowa Oferta
                    </button>
                )}
            </div>

            {isCreating && (
                <div className="glass-panel" style={{ marginBottom: '32px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3>Kreator Nowej Wyceny / Kosztorysu</h3>
                        <button className="btn btn-outline" onClick={() => setIsCreating(false)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                    </div>

                    <div className="grid grid-2" style={{ gap: '16px' }}>
                        <div className="form-group">
                            <label>Numer Oferty</label>
                            <input type="text" value={docNum} onChange={e => setDocNum(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Data wystawienia</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Nazwa Kontrahenta / Imię i Nazwisko</label>
                            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Wpisz nazwę inwestora" required />
                        </div>
                        <div className="form-group">
                            <label>Dane Kontaktowe / Adres obiektu (Opcjonalnie)</label>
                            <input type="text" value={clientData} onChange={e => setClientData(e.target.value)} placeholder="np. ul. Lipowa 4, Tel 123..." />
                        </div>
                    </div>

                    <h4 style={{ marginTop: '24px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>Pozycje na ofercie</h4>

                    <form onSubmit={addItem} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Nazwa Towaru/Usługi</label>
                            <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Ilość</label>
                            <input type="number" step="0.1" value={newItemQty} onChange={e => setNewItemQty(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Cena jn. netto/brutto (zł)</label>
                            <input type="text" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
                        </div>
                        <button type="submit" className="btn btn-outline" style={{ height: '35px', padding: '0 16px' }}>
                            <Plus size={16} /> Wstaw do wyceny
                        </button>
                    </form>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                        {itemsList.map(item => (
                            <button key={item.id} type="button" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '12px' }} onClick={() => { setNewItemName(item.name); setNewItemPrice(item.defaultPrice?.toString() || '0'); }}>
                                + Usługa: {item.name}
                            </button>
                        ))}
                        {invList.map(item => (
                            <button key={item.id} type="button" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '4px 8px', borderRadius: '12px', borderColor: '#bfdbfe', color: '#1d4ed8' }} onClick={() => { setNewItemName(item.name); }}>
                                + Magazyn: {item.name}
                            </button>
                        ))}
                    </div>

                    <table className="data-table" style={{ marginTop: '16px', marginBottom: '24px' }}>
                        <thead>
                            <tr>
                                <th>Lp.</th>
                                <th>Nazwa usługi/towaru</th>
                                <th>Ilość/Miara</th>
                                <th>Cena jn. (zł)</th>
                                <th>Kwota (zł)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{it.name}</td>
                                    <td>{it.quantity}</td>
                                    <td>{it.price.toFixed(2)}</td>
                                    <td style={{ fontWeight: 600 }}>{it.total.toFixed(2)}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-danger" style={{ padding: '4px' }} onClick={() => { const newItems = [...items]; newItems.splice(idx, 1); setItems(newItems); }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {items.length === 0 && (
                                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>Dodaj pierwszą pozycję do kosztorysu...</td></tr>
                            )}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--border-color)', paddingTop: '16px' }}>
                        <div style={{ fontSize: '1.2rem' }}>Razem: <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{items.reduce((s, i) => s + i.total, 0).toFixed(2)} zł</span></div>
                        <button className="btn btn-primary" onClick={handleCreate} disabled={items.length === 0 || !clientName}>
                            Zapisz Kosztorys
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-3" style={{ gap: '16px' }}>
                {quotes?.map(quote => (
                    <div key={quote.id} className="glass-panel" style={{ padding: '24px', position: 'relative', borderTop: `4px solid ${quote.status === 'accepted' ? 'var(--success-color)' : quote.status === 'draft' ? '#fbbf24' : '#94a3b8'}` }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#1e293b' }}>{quote.clientName}</h3>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            <FileText size={14} style={{ display: 'inline', marginRight: '4px' }} /> {quote.documentNumber}
                        </div>

                        <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {quote.amount.toFixed(2)} zł
                        </div>

                        <ul style={{ fontSize: '0.85rem', color: '#475569', paddingLeft: '20px', marginBottom: '24px', lineHeight: '1.5' }}>
                            {quote.items.slice(0, 3).map((it, idx) => (
                                <li key={idx}>{it.name} (x{it.quantity})</li>
                            ))}
                            {quote.items.length > 3 && <li>... i {quote.items.length - 3} innych pozycji</li>}
                        </ul>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-outline" onClick={() => generatePdf(quote)} style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '8px', gap: '4px' }}>
                                <FileDown size={16} /> PDF
                            </button>
                            <button className="btn btn-primary" onClick={async () => {
                                const ans = window.confirm('Oznaczyć jako ZAKCEPTOWANE?');
                                if (ans) {
                                    await db.quotes.update(quote.id!, { status: 'accepted' });
                                }
                            }} style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '8px', gap: '4px' }} disabled={quote.status === 'accepted'}>
                                {quote.status === 'accepted' ? <CheckCircle size={16} /> : <Clock size={16} />}
                                {quote.status === 'accepted' ? 'Akcept.' : 'Akceptuj Ofertę'}
                            </button>
                        </div>
                        {quote.status !== 'accepted' && (
                            <button className="btn btn-danger" onClick={() => { if (window.confirm('Usunąć tę ofertę?')) db.quotes.delete(quote.id!); }} style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }} title="Usuń Ofertę">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}

                {quotes?.length === 0 && !isCreating && (
                    <div style={{ gridColumn: 'span 3', padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <br />
                        Brak ofert. Skalkuluj wycenę swojemu pierwszemu klientowi.
                    </div>
                )}
            </div>
        </div>
    );
}
