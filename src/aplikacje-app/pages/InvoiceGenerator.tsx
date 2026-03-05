import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from '../components/InvoicePDF';
import { format } from 'date-fns';
import { FileDown, Calendar, Hash, User, AlignLeft, DollarSign, CreditCard } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function InvoiceGenerator() {
    const settings = useLiveQuery(() => db.settings.get(1));
    const clients = useLiveQuery(() => db.clients.toArray());
    const services = useLiveQuery(() => db.services.toArray());

    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [docNumber, setDocNumber] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientData, setClientData] = useState('');
    const [serviceName, setServiceName] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Gotówka');
    const [paymentDays, setPaymentDays] = useState('7');
    const [isGenerating, setIsGenerating] = useState(false);

    const salesThisMonth = useLiveQuery(() =>
        db.sales
            .where('date')
            .between(`${date.substring(0, 8)}01`, `${date.substring(0, 8)}31`, true, true)
            .toArray()
        , [date]);

    useEffect(() => {
        if (salesThisMonth !== undefined && docNumber === '') {
            setDocNumber(`${salesThisMonth.length + 1}/${date.substring(5, 7)}/${date.substring(0, 4)}`);
        }
    }, [salesThisMonth, date]);

    const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const c = clients?.find(cl => cl.name === e.target.value);
        if (c) {
            setClientName(c.name);
            setClientData(`${c.address}\nNIP: ${c.taxId}`);
        } else {
            setClientName(e.target.value);
        }
    };

    const currentData = {
        issueDate: date,
        execDate: date,
        docNumber,
        clientName,
        clientData,
        serviceName,
        paymentMethod,
        paymentDays,
        amount: amount ? parseFloat(amount).toFixed(2) : '0.00'
    };

    const handleDownload = async () => {
        setIsGenerating(true);
        try {
            const blob = await pdf(<InvoicePDF data={currentData} settings={settings} />).toBlob();
            saveAs(blob, `Rachunek_${docNumber.replace(/\//g, '_')}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Wystąpił błąd podczas generowania PDF. Spróbuj ponownie.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="container">
            <h1>Wystaw Rachunek / Fakturę bez VAT</h1>
            <p style={{ color: 'var(--text-muted)' }}>Wygeneruj profesjonalny dokument dla swojego klienta.</p>

            <div className="grid grid-2" style={{ marginTop: '32px' }}>
                <div className="glass-panel">
                    <h3>Dane na rachunku</h3>
                    <div className="form-group" style={{ marginTop: '16px' }}>
                        <label><Hash size={14} /> Numer rachunku</label>
                        <input type="text" value={docNumber} onChange={e => setDocNumber(e.target.value)} placeholder="np. 1/03/2026" />
                    </div>
                    <div className="form-group">
                        <label><Calendar size={14} /> Data wystawienia i wykonania usługi</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label><User size={14} /> Nabywca (Wybierz klienta)</label>
                        <select onChange={handleClientSelect} value={clientName} style={{ marginBottom: '8px' }}>
                            <option value="">Wybierz z bazy...</option>
                            {clients?.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nazwa nabywcy" style={{ marginBottom: '8px' }} />
                        <textarea value={clientData} onChange={e => setClientData(e.target.value)} placeholder="Adres nabywcy, NIP" rows={3}></textarea>
                    </div>
                    <div className="form-group">
                        <label><AlignLeft size={14} /> Usługa</label>
                        <select onChange={e => {
                            const s = services?.find(sv => sv.name === e.target.value);
                            if (s) {
                                setServiceName(s.name);
                                setAmount(s.defaultPrice.toString());
                            } else {
                                setServiceName(e.target.value);
                            }
                        }} value={serviceName} style={{ marginBottom: '8px' }}>
                            <option value="">Wybierz usługę...</option>
                            {services?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                        <input type="text" value={serviceName} onChange={e => setServiceName(e.target.value)} placeholder="Nazwa usługi" />
                    </div>
                    <div className="form-group">
                        <label><DollarSign size={14} /> Kwota brutto (zł)</label>
                        <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>

                    <div className="grid grid-2" style={{ gap: '16px' }}>
                        <div className="form-group">
                            <label><CreditCard size={14} /> Metoda Płatności</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                <option value="Gotówka">Gotówka</option>
                                <option value="Przelew">Przelew</option>
                                <option value="Przedpłata">Przedpłata (zapłacone)</option>
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

                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '24px' }}>Podgląd Rachunku</h2>
                    <div style={{ background: 'var(--surface-color)', padding: '24px', borderRadius: '12px', border: '1px solid var(--surface-border)', width: '100%', maxWidth: '300px', marginBottom: '32px', textAlign: 'left' }}>
                        <p style={{ fontWeight: 'bold' }}>Nr: {docNumber || 'X/XXXX'}</p>
                        <hr style={{ borderColor: 'var(--surface-border)', margin: '12px 0' }} />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nabywca:</p>
                        <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>{clientName || 'Brak danych'}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Usługa:</p>
                        <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>{serviceName || 'Brak nazwy usługi'}</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)', textAlign: 'right' }}>
                            {currentData.amount} zł
                        </p>
                    </div>

                    {(docNumber && clientName && serviceName && amount) ? (
                        <button className="btn btn-primary" disabled={isGenerating} onClick={handleDownload} style={{ textDecoration: 'none' }}>
                            <FileDown size={18} /> {isGenerating ? 'Generowanie PDF...' : 'Pobierz Rachunek PDF'}
                        </button>
                    ) : (
                        <button className="btn btn-primary" disabled style={{ opacity: 0.5 }}>
                            Wypełnij wszystkie pola aby pobrać
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
