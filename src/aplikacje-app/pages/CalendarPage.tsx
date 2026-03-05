import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Calendar, Trash2, CheckCircle } from 'lucide-react';
import { format, isBefore, addYears } from 'date-fns';

export default function CalendarPage() {
    const events = useLiveQuery(() => db.calendarEvents.orderBy('date').toArray());

    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [clientName, setClientName] = useState('');
    const [isReview5Y, setIsReview5Y] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) return;

        let eventDate = date;

        if (isReview5Y) {
            // Jeśli to przegląd 5 letni to ustaw datę przypomnienia za 5 lat pomniejszoną o miesiąc
            const date5y = addYears(new Date(date), 5);
            date5y.setMonth(date5y.getMonth() - 1); // 1 miesiąc wcześniej przypomnienie
            eventDate = format(date5y, 'yyyy-MM-dd');
        }

        await db.calendarEvents.add({
            date: eventDate,
            title: isReview5Y ? `Przypomnienie o pomiarach 5-letnich: ${clientName || 'Klient'}` : title,
            description: desc,
            clientName,
            isCompleted: false
        });

        setTitle(''); setDesc(''); setClientName(''); setIsReview5Y(false);
    };

    const todayStr = format(new Date(), 'yyyy-MM-dd');

    return (
        <div className="container">
            <h1>Kalendarz i Przypomnienia</h1>
            <p style={{ color: 'var(--text-muted)' }}>Dodaj ręczne spotkania lub korzystaj z harmonogramu przeglądów za 5 lat.</p>

            <div className="glass-panel" style={{ marginTop: '32px' }}>
                <h3 style={{ marginBottom: '24px' }}>Nowe wydarzenie</h3>
                <form onSubmit={handleAdd}>
                    <div className="grid grid-2" style={{ gap: '16px' }}>
                        <div className="form-group">
                            <label>Data wydarzenia</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />

                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" id="rev5" checked={isReview5Y} onChange={e => setIsReview5Y(e.target.checked)} style={{ width: 'auto' }} />
                                <label htmlFor="rev5" style={{ margin: 0 }}>To jest instalacja i chce przypomninia za 5 lat</label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Tytuł spotkania</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required={!isReview5Y} disabled={isReview5Y} placeholder={isReview5Y ? "Tytuł wygeneruje się sam" : "np. Montaż lamp"} />
                        </div>

                        <div className="form-group">
                            <label>Klient</label>
                            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Imię klienta / Nazwa" />
                        </div>

                        <div className="form-group">
                            <label>Opis / Adres (opcjonalnie)</label>
                            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Gdzie jedziemy?" />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>Zapisz do Kalendarza</button>
                </form>
            </div>

            <div style={{ marginTop: '32px' }}>
                <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={24} color="var(--primary-color)" /> Nadchodzące spotkania
                </h2>
                <div className="grid grid-2" style={{ gap: '16px' }}>
                    {events?.filter(e => !e.isCompleted).map(evt => {
                        const isPast = isBefore(new Date(evt.date), new Date(todayStr)) && evt.date !== todayStr;
                        const isToday = evt.date === todayStr;

                        return (
                            <div key={evt.id} style={{
                                background: isPast ? 'rgba(239, 68, 68, 0.1)' : isToday ? 'rgba(56, 189, 248, 0.1)' : 'var(--surface-color)',
                                padding: '16px', borderRadius: '12px', border: `1px solid ${isPast ? 'var(--danger-color)' : isToday ? 'var(--primary-color)' : 'var(--surface-border)'}`
                            }}>
                                <div className="flex-between" style={{ marginBottom: '8px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isPast ? 'var(--danger-color)' : 'var(--text-main)' }}>
                                        {evt.date} {isToday && <span className="badge badge-blue" style={{ marginLeft: '8px' }}>Dziś!</span>}
                                        {isPast && <span className="badge badge-danger" style={{ background: 'var(--danger-color)', color: '#fff', marginLeft: '8px' }}>Zaległe</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn btn-success" onClick={async () => await db.calendarEvents.update(evt.id!, { isCompleted: true })} style={{ padding: '4px', background: 'rgba(34, 197, 94, 0.2)', border: 'none', color: 'var(--success-color)', borderRadius: '6px', cursor: 'pointer' }}>
                                            <CheckCircle size={20} />
                                        </button>
                                        <button className="btn btn-danger" onClick={async () => await db.calendarEvents.delete(evt.id!)} style={{ padding: '4px' }}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                                <h4 style={{ margin: '8px 0' }}>{evt.title}</h4>
                                {evt.clientName && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>👤 {evt.clientName}</div>}
                                {evt.description && <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>📍 {evt.description}</div>}
                            </div>
                        );
                    })}

                    {events?.filter(e => !e.isCompleted).length === 0 && (
                        <div style={{ color: 'var(--text-muted)' }}>Brak nadchodzących wydarzeń.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
