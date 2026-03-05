import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Download, BarChart2, Users, PieChart } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { saveAs } from 'file-saver';

export default function Reports() {
    const [reportType, setReportType] = useState('finances');
    const [dateFrom, setDateFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [dateTo, setDateTo] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    const sales = useLiveQuery(() =>
        db.sales.where('date').between(dateFrom, dateTo, true, true).toArray(),
        [dateFrom, dateTo]
    ) || [];

    const expenses = useLiveQuery(() =>
        db.expenses.where('date').between(dateFrom, dateTo, true, true).toArray(),
        [dateFrom, dateTo]
    ) || [];

    // Raport 1: Zestawienie Finansowe
    const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const income = totalSales - totalExpenses;

    const exportFinancesCSV = () => {
        let csv = '\uFEFFDATA;TYP;DOKUMENT;KONTRAHENT/OPIS;PRZYCHÓD;KOSZT\n';

        const allItems = [
            ...sales.map(s => ({ date: s.date, type: 'Przychód', doc: s.documentNumber, desc: s.clientName, income: s.amount, expense: 0 })),
            ...expenses.map(e => ({ date: e.date, type: 'Koszt', doc: e.documentNumber, desc: e.title || e.description, income: 0, expense: e.amount }))
        ].sort((a, b) => a.date.localeCompare(b.date));

        allItems.forEach(i => {
            csv += `${i.date};${i.type};${i.doc || ''};${i.desc || ''};${i.income.toFixed(2)};${i.expense.toFixed(2)}\n`;
        });

        csv += `\n;;;PODSUMOWANIE:;${totalSales.toFixed(2)};${totalExpenses.toFixed(2)}\n`;
        csv += `;;;DOCHÓD:;${income.toFixed(2)};\n`;

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Raport_Finansowy_${dateFrom}_${dateTo}.csv`);
    };

    // Raport 2: Ranking Klientów
    const clientsRanking = sales.reduce((acc, sale) => {
        acc[sale.clientName] = (acc[sale.clientName] || 0) + sale.amount;
        return acc;
    }, {} as Record<string, number>);

    const sortedClients = Object.entries(clientsRanking)
        .sort(([, a], [, b]) => b - a)
        .map(([name, amount]) => ({ name, amount }));

    // Raport 3: Popularność usług
    const servicesRanking = sales.reduce((acc, sale) => {
        if (sale.items && sale.items.length > 0) {
            sale.items.forEach((item: any) => {
                const total = item.total || parseFloat(item.amount || item.price || 0);
                acc[item.name] = (acc[item.name] || 0) + total;
            });
        } else if (sale.serviceName) {
            acc[sale.serviceName] = (acc[sale.serviceName] || 0) + sale.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    const sortedServices = Object.entries(servicesRanking)
        .sort(([, a], [, b]) => b - a)
        .map(([name, amount]) => ({ name, amount }));

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1>Generator Raportów</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Analizuj swoje finanse, sprawdzaj, którzy klienci dają najwięcej zarobić i jakie usługi są najpopularniejsze.</p>
                </div>
            </div>

            <div className="grid grid-4" style={{ gap: '16px', marginBottom: '32px' }}>
                <button
                    className={`btn ${reportType === 'finances' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setReportType('finances')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
                >
                    <BarChart2 size={24} />
                    Zestawienie Finansowe
                </button>
                <button
                    className={`btn ${reportType === 'clients' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setReportType('clients')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
                >
                    <Users size={24} />
                    Ranking Klientów
                </button>
                <button
                    className={`btn ${reportType === 'services' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setReportType('services')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px' }}
                >
                    <PieChart size={24} />
                    Popularność Usług
                </button>
            </div>

            <div className="glass-panel" style={{ marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'flex-end', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600, color: 'var(--text-muted)' }}>Data od:</label>
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600, color: 'var(--text-muted)' }}>Data do:</label>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: '100%', padding: '10px' }} />
                </div>
                <div>
                    <button className="btn btn-outline" onClick={() => {
                        setDateFrom(format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
                        setDateTo(format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'));
                    }} style={{ height: '42px' }}>Poprzedni miesiąc</button>
                </div>
            </div>

            {reportType === 'finances' && (
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2>Zestawienie Finansowe</h2>
                        <button className="btn btn-primary" onClick={exportFinancesCSV}>
                            <Download size={18} /> Eksportuj do CSV
                        </button>
                    </div>

                    <div className="grid grid-3" style={{ gap: '16px', marginBottom: '32px' }}>
                        <div style={{ background: '#dcfce7', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <div style={{ fontSize: '0.9rem', color: '#166534', marginBottom: '4px' }}>Suma Przychodów</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#15803d' }}>{totalSales.toFixed(2)} zł</div>
                        </div>
                        <div style={{ background: '#fee2e2', padding: '16px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                            <div style={{ fontSize: '0.9rem', color: '#991b1b', marginBottom: '4px' }}>Suma Kosztów</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#b91c1c' }}>{totalExpenses.toFixed(2)} zł</div>
                        </div>
                        <div style={{ background: income >= 0 ? '#e0f2fe' : '#f3f4f6', padding: '16px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                            <div style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '4px' }}>Dochód (Zysk)</div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0284c7' }}>{income.toFixed(2)} zł</div>
                        </div>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Szczegółowy podział wszystkich transakcji (przychodów i kosztów) jest dostępny w pliku CSV po kliknięciu "Eksportuj do CSV". Raport ten jest idealny do rozliczeń podatkowych lub archiwizacji.
                    </p>
                </div>
            )}

            {reportType === 'clients' && (
                <div className="glass-panel">
                    <h2 style={{ marginBottom: '24px' }}>Ranking Klientów w wybranym okresie</h2>
                    {sortedClients.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px', textAlign: 'center' }}>Miejsce</th>
                                    <th>Nazwa Klienta</th>
                                    <th style={{ textAlign: 'right' }}>Wygenerowany Przychód</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedClients.map((client, index) => (
                                    <tr key={client.name}>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: index < 3 ? 'var(--primary-color)' : 'inherit' }}>#{index + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{client.name}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#15803d' }}>{client.amount.toFixed(2)} zł</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Brak danych o przychodach w wybranym okresie.</p>
                    )}
                </div>
            )}

            {reportType === 'services' && (
                <div className="glass-panel">
                    <h2 style={{ marginBottom: '24px' }}>Najlepiej zarabiające usługi</h2>
                    {sortedServices.length > 0 ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px', textAlign: 'center' }}>Miejsce</th>
                                    <th>Nazwa Usługi / Towaru</th>
                                    <th style={{ textAlign: 'right' }}>Łączna kwota netto/brutto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedServices.map((service, index) => (
                                    <tr key={service.name}>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: index < 3 ? 'var(--primary-color)' : 'inherit' }}>#{index + 1}</td>
                                        <td style={{ fontWeight: 600 }}>{service.name}</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#15803d' }}>{service.amount.toFixed(2)} zł</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Brak wpisów o usługach na rachunkach w wybranym okresie.</p>
                    )}
                </div>
            )}
        </div>
    );
}
