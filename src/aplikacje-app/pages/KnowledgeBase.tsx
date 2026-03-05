import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Trash2, FileText, Plus, BookOpen, Paperclip, Download } from 'lucide-react';

export default function KnowledgeBase() {
    const knowledge = useLiveQuery(() => db.knowledge.toArray());

    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
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
        if (!title || !category) return;

        await db.knowledge.add({
            title,
            category,
            content,
            attachment
        });

        setTitle(''); setCategory(''); setContent(''); setAttachment('');
        setIsAdding(false);
    };

    const categories = Array.from(new Set(knowledge?.map(k => k.category) || []));

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Baza Wiedzy / Normy</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Twoja biblioteka – tabele wyłączeń RCD, skany uprawnień SEP i inne materiały zawsze pod ręką.</p>
                </div>
                {!isAdding && (
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Dodaj wpis lub plik
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="glass-panel" style={{ marginTop: '32px', border: '1px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h3><BookOpen size={18} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} /> Nowy wpis w Bazie Wiedzy</h3>
                        <button className="btn btn-outline" onClick={() => setIsAdding(false)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                    </div>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-2" style={{ gap: '16px' }}>
                            <div className="form-group">
                                <label>Tytuł (np. Tabela RCD, Uprawnienia SEP nr 123)</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Kategoria</label>
                                <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Normy, Uprawnienia, Notatki..." required />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label>Treść wpisu (Opcjonalnie)</label>
                                <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Przydatne dane przypisane do tego wpisu (możesz też dołączyć sam załącznik / zdjęcie)" style={{ padding: '12px', minHeight: '100px', width: '100%', borderRadius: '6px', border: '1px solid var(--surface-border)', fontFamily: 'inherit' }} />
                            </div>
                            <div className="form-group">
                                <label><Paperclip size={14} /> Dodaj załącznik (PDF / Zdjęcie)</label>
                                <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Dodaj do Bazy Wiedzy
                        </button>
                    </form>
                </div>
            )}

            <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {categories.length === 0 && !isAdding && (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        Twoja baza wiedzy jest pusta. Dodaj tu np. maksymalne pętle zwarcia albo kopię swoich uprawnień do szybkiego dostępu.
                    </div>
                )}
                {categories.map(cat => (
                    <div key={cat} className="glass-panel">
                        <h2 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>
                            <FileText size={20} color="var(--primary-color)" /> {cat}
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                            {knowledge?.filter(k => k.category === cat).map(entry => (
                                <div key={entry.id} style={{ background: 'var(--surface-color)', padding: '16px', borderRadius: '8px', border: '1px solid var(--surface-border)', position: 'relative' }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', paddingRight: '32px' }}>{entry.title}</h3>

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => db.knowledge.delete(entry.id!)}
                                        style={{ padding: '6px', position: 'absolute', top: '16px', right: '16px' }}
                                        title="Usuń wpis"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    {entry.content && (
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', whiteSpace: 'pre-line' }}>{entry.content}</p>
                                    )}
                                    {entry.attachment && (
                                        <a href={entry.attachment} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', padding: '8px 12px', fontSize: '0.85rem' }}>
                                            <Download size={16} style={{ marginRight: '6px' }} /> Otwórz załącznik
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
