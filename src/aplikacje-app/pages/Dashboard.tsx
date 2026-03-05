import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { startOfQuarter, endOfQuarter, format, startOfYear, endOfYear } from 'date-fns';

import { TrendingUp, AlertCircle, TrendingDown, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { saveAs } from 'file-saver';

export default function Dashboard() {
    const [currentDate] = useState(new Date());
    const quarterStart = startOfQuarter(currentDate);
    const quarterEnd = endOfQuarter(currentDate);

    const settings = useLiveQuery(() => db.settings.get(1));
    const equipment = useLiveQuery(() => db.equipment.toArray());

    const quarterSales = useLiveQuery(() =>
        db.sales
            .where('date')
            .between(format(quarterStart, 'yyyy-MM-dd'), format(quarterEnd, 'yyyy-MM-dd'), true, true)
            .toArray()
    );

    const quarterExpenses = useLiveQuery(() =>
        db.expenses
            .where('date')
            .between(format(quarterStart, 'yyyy-MM-dd'), format(quarterEnd, 'yyyy-MM-dd'), true, true)
            .toArray()
    );

    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);

    const yearSales = useLiveQuery(() =>
        db.sales.where('date').between(format(yearStart, 'yyyy-MM-dd'), format(yearEnd, 'yyyy-MM-dd'), true, true).toArray()
    );

    const yearExpenses = useLiveQuery(() =>
        db.expenses.where('date').between(format(yearStart, 'yyyy-MM-dd'), format(yearEnd, 'yyyy-MM-dd'), true, true).toArray()
    );

    const totalSales = quarterSales?.reduce((acc, sale) => acc + sale.amount, 0) || 0;
    const totalExpenses = quarterExpenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0;

    const limit = settings?.quarterlyLimit || 10498.50;
    const percentage = Math.min((totalSales / limit) * 100, 100);
    const isSafe = percentage < 75;
    const isWarning = percentage >= 75 && percentage <= 95;
    const isDanger = percentage > 95;

    const barClass = isSafe ? 'progress-safe' : isWarning ? 'progress-warning' : 'progress-danger';

    const generateCSV = () => {
        if (!yearSales && !yearExpenses) return;
        const sumSales = yearSales?.reduce((acc, s) => acc + s.amount, 0) || 0;
        const sumExp = yearExpenses?.reduce((acc, e) => acc + e.amount, 0) || 0;

        let csv = '\uFEFF'; // BOM
        csv += 'ROCZNE ZESTAWIENIE DO PIT-36 (DZIAŁALNOŚĆ NIEREJESTROWANA)\n\n';
        csv += `Rok: ${currentDate.getFullYear()}\n`;
        csv += `Calkowity Przychod: ${sumSales.toFixed(2)} PLN\n`;
        csv += `Calkowite Koszty: ${sumExp.toFixed(2)} PLN\n`;
        csv += `Dochod to opodatkowania: ${(sumSales - sumExp).toFixed(2)} PLN\n\n`;
        csv += 'DATA;TYP;DOKUMENT;KONTRAHENT/OPIS;KWOTA PLN\n';

        const allItems = [
            ...(yearSales || []).map(s => ({ ...s, typ: 'Przychód' })),
            ...(yearExpenses || []).map(e => ({ ...e, typ: 'Koszt', clientName: e.description }))
        ].sort((a, b) => a.date.localeCompare(b.date));

        allItems.forEach(i => {
            csv += `${i.date};${i.typ};${i.documentNumber || ''};${i.clientName || ''};${i.amount}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Zestawienie_Roczne_${currentDate.getFullYear()}.csv`);
    };

    const qMap = [0, 0, 0, 0];
    const qExp = [0, 0, 0, 0];
    yearSales?.forEach(s => { const q = Math.floor((new Date(s.date).getMonth()) / 3); qMap[q] += s.amount; });
    yearExpenses?.forEach(e => { const q = Math.floor((new Date(e.date).getMonth()) / 3); qExp[q] += e.amount; });

    const chartData = [
        { name: 'Q1', Przychod: qMap[0], Koszty: qExp[0] },
        { name: 'Q2', Przychod: qMap[1], Koszty: qExp[1] },
        { name: 'Q3', Przychod: qMap[2], Koszty: qExp[2] },
        { name: 'Q4', Przychod: qMap[3], Koszty: qExp[3] }
    ];

    const expiringEquipment = equipment?.filter(eq => {
        const today = new Date();
        const target = new Date(eq.calibrationDate);
        const df = target.getTime() - today.getTime();
        const daysLeft = Math.ceil(df / (1000 * 3600 * 24));
        return daysLeft <= 14;
    }) || [];

    return (
        <div className="container">
            <div className="flex-between">
                <div>
                    <h1>Podsumowanie</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Okres: {format(quarterStart, 'dd.MM.yyyy')} - {format(quarterEnd, 'dd.MM.yyyy')}</p>
                </div>
                <button onClick={generateCSV} className="btn btn-primary" style={{ height: 'fit-content' }}>
                    <Download size={18} /> Raport Roczny PIT-36 (CSV)
                </button>
            </div>

            {expiringEquipment.length > 0 && (
                <div style={{ marginTop: '24px', background: '#fee2e2', borderLeft: '4px solid var(--danger-color)', padding: '16px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {expiringEquipment.map(eq => {
                        const daysLeft = Math.ceil((new Date(eq.calibrationDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                        return (
                            <div key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#991b1b', fontWeight: 'bold' }}>
                                <AlertCircle size={20} />
                                <span>UWAGA! {daysLeft <= 0 ? 'Upłynął' : `Za ${daysLeft} dni kończy się`} termin wzorcowania miernika: {eq.model} (SN: {eq.serialNumber})</span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="grid grid-2" style={{ marginTop: '32px' }}>
                <div className="glass-panel">
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Przychód w tym kwartale</h3>
                        <div style={{ background: '#dbeafe', padding: '8px', borderRadius: '50%' }}>
                            <TrendingUp color="var(--primary-color)" size={24} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{totalSales.toFixed(2)} zł</h2>

                    <div style={{ marginTop: '24px' }}>
                        <div className="flex-between" style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                            <span>Wykorzystanie limitu ({limit.toFixed(2)} zł)</span>
                            <span style={{ fontWeight: 600, color: isDanger ? 'var(--danger-color)' : isWarning ? 'var(--warning-color)' : 'var(--success-color)' }}>
                                {percentage.toFixed(1)}%
                            </span>
                        </div>
                        <div className="progress-bar-container">
                            <div className={`progress-bar-fill ${barClass}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        {isDanger && (
                            <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <AlertCircle size={14} /> Uwaga! Zbliżasz się do przekroczenia limitu działalności nierejestrowanej!
                            </p>
                        )}
                    </div>
                </div>

                <div className="glass-panel">
                    <div className="flex-between" style={{ marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Koszty w tym kwartale</h3>
                        <div style={{ background: '#fee2e2', padding: '8px', borderRadius: '50%' }}>
                            <TrendingDown color="var(--danger-color)" size={24} />
                        </div>
                    </div>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{totalExpenses.toFixed(2)} zł</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '24px' }}>
                        Pamiętaj, aby zbierać faktury. Wysokie koszty mogą obniżyć Twój podatek na koniec roku rozliczeniowego.
                    </p>
                </div>
            </div>

            <div style={{ marginTop: '48px' }}>
                <div className="flex-between">
                    <h2>Ostatnie dokumenty sprzedaży</h2>
                </div>
                <div className="glass-panel" style={{ marginTop: '16px', padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Numer dokumentu</th>
                                <th>Klient</th>
                                <th>Usługa</th>
                                <th style={{ textAlign: 'right' }}>Kwota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quarterSales?.slice(0, 5).reverse().map(sale => (
                                <tr key={sale.id}>
                                    <td>{sale.date}</td>
                                    <td style={{ fontWeight: 500 }}>{sale.documentNumber}</td>
                                    <td>{sale.clientName}</td>
                                    <td>{sale.serviceName}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary-color)' }}>{sale.amount.toFixed(2)} zł</td>
                                </tr>
                            ))}
                            {quarterSales?.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        Brak wpisów w tym kwartale.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="glass-panel" style={{ marginTop: '32px' }}>
                <h3 style={{ marginBottom: '24px', color: 'var(--text-muted)' }}>Wykres Zyskowności ({currentDate.getFullYear()})</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="name" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip contentStyle={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)' }} />
                            <Bar dataKey="Przychod" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Koszty" fill="var(--danger-color)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
