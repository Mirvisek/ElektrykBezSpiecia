import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, X, Camera, Calendar, User, AlignLeft, CheckCircle, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

export default function ConstructionLog() {
    const clients = useLiveQuery(() => db.clients.toArray());
    const projectLogs = useLiveQuery(() => db.projectLogs.toArray());

    const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        id: undefined as number | undefined,
        clientId: '' as number | '',
        date: format(new Date(), 'yyyy-MM-dd'),
        stage: 'Etap Układania Peszli',
        description: '',
        photos: [] as string[]
    });

    const filteredLogs = useMemo(() => {
        let logs = projectLogs || [];
        if (selectedClientId !== '') {
            logs = logs.filter(l => l.clientId === selectedClientId);
        }
        return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [projectLogs, selectedClientId]);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const result = event.target?.result as string;
                if (result) {
                    setFormData(prev => ({
                        ...prev,
                        photos: [...prev.photos, result]
                    }));
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.clientId === '') return alert('Kogo dotyczy ten wpis? Zaznacz u samej góry "Wybierz klienta" 😊');

        const logData = {
            clientId: Number(formData.clientId),
            date: formData.date,
            stage: formData.stage,
            description: formData.description,
            photos: formData.photos
        };

        if (formData.id) {
            await db.projectLogs.update(formData.id, logData);
        } else {
            await db.projectLogs.add(logData);
        }

        setShowForm(false);
        setFormData({ id: undefined, clientId: '', date: format(new Date(), 'yyyy-MM-dd'), stage: 'Etap Układania Peszli', description: '', photos: [] });
    };

    const editLog = (log: any) => {
        setFormData(log);
        setShowForm(true);
    };

    const deleteLog = async (id: number) => {
        if (window.confirm('Czy na pewno chcesz usunąć ten raport? Odzyskanie bazy zdjęć i opisów do logu z tego dnia będzie niemożliwe.')) {
            await db.projectLogs.delete(id);
        }
    };

    const getClientName = (id: number) => {
        return clients?.find(c => c.id === id)?.name || 'Nieznany klient';
    };

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1>Dziennik Budowy (Raportowanie na żywo)</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Prosty notatnik i dokumentator prac. Daj swoim inwestorom pełen wgląd w ułożenie przewodów.</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setFormData({ id: undefined, clientId: selectedClientId !== '' ? selectedClientId : '', date: format(new Date(), 'yyyy-MM-dd'), stage: 'Etap Układania Peszli', description: '', photos: [] });
                    setShowForm(true);
                }}>
                    <Plus size={18} /> Nowy wpis do dziennika
                </button>
            </div>

            <div className="glass-panel" style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <User size={20} color="var(--text-muted)" />
                <select
                    value={selectedClientId}
                    onChange={e => setSelectedClientId(e.target.value === '' ? '' : Number(e.target.value))}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)', background: '#fff' }}
                >
                    <option value="">Wszyscy Klienci</option>
                    {clients?.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {showForm && (
                <div className="glass-panel slide-down" style={{ marginBottom: '24px', borderTop: '4px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h2 style={{ fontSize: '1.25rem' }}>{formData.id ? 'Edytuj wpis' : 'Nowy wpis fotograficzny'}</h2>
                        <button onClick={() => setShowForm(false)} className="btn btn-outline" style={{ padding: '8px' }}><X size={18} /></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label>Klient / Inwestor</label>
                                <select required value={formData.clientId} onChange={e => setFormData(prev => ({ ...prev, clientId: e.target.value === '' ? '' : Number(e.target.value) }))}>
                                    <option value="">Wybierz klienta...</option>
                                    {clients?.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Data wykonania prac</label>
                                <input type="date" required value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} />
                            </div>
                            <div className="form-group">
                                <label>Etap robót (Wybierz lub wpisz własny)</label>
                                <input type="text" list="stages" required placeholder="np. Kucie bruzd, Układanie tras..." value={formData.stage} onChange={e => setFormData(prev => ({ ...prev, stage: e.target.value }))} />
                                <datalist id="stages">
                                    <option value="Tyczenie i Trasowanie" />
                                    <option value="Kucie bruzd" />
                                    <option value="Wiercenie pod puszki" />
                                    <option value="Układanie okablowania (Ściany)" />
                                    <option value="Układanie peszli (Podłoga)" />
                                    <option value="Montaż i osadzenie puszek" />
                                    <option value="Zarabianie w puszkach i sznurowanie" />
                                    <option value="Oszycie rozdzielnicy" />
                                    <option value="Biały Montaż (Gniazdka/Lampy)" />
                                    <option value="Pomiary Końcowe i Oddanie" />
                                </datalist>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Szczegółowa notatka dla klienta (Co zostało zrobione?)</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Wypisz dokładnie użyte w danym dniu rozwiązania lub ustalenia i poinformuj klienta co zostało ułożone i gdzie..."
                                value={formData.description}
                                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label>Zdjęcia wykonanych instalacji</label>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                {formData.photos.map((photo, index) => (
                                    <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
                                        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(index)}
                                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', border: '2px dashed var(--primary-color)', borderRadius: '8px', cursor: 'pointer', background: '#f8fafc', color: 'var(--primary-color)' }}>
                                    <Camera size={24} style={{ marginBottom: '8px' }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Dodaj</span>
                                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            <CheckCircle size={18} /> {formData.id ? 'Zapisz zmiany' : 'Opublikuj w dzienniku'}
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredLogs.length === 0 && (
                    <div style={{ padding: '48px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px', border: '2px dashed var(--surface-border)', color: 'var(--text-muted)' }}>
                        <Camera size={48} style={{ opacity: 0.2, marginBottom: '16px', display: 'inline-block' }} />
                        <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Brak logów z budowy</h3>
                        <p>Zacznij dokumentować proces inwestycji i ukazywać swoje profesjonalnie ułożone przewody.</p>
                    </div>
                )}

                {filteredLogs.map(log => (
                    <div key={log.id} className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', background: '#f8fafc', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {log.stage}
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '4px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} /> {log.date}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><User size={14} /> {getClientName(log.clientId)}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-outline" style={{ padding: '6px' }} onClick={() => editLog(log)}>
                                    <Edit size={16} />
                                </button>
                                <button className="btn btn-outline" style={{ padding: '6px', color: 'var(--danger-color)' }} onClick={() => deleteLog(log.id!)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-main)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <AlignLeft size={20} color="var(--primary-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                {log.description}
                            </p>

                            {log.photos && log.photos.length > 0 && (
                                <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                    {log.photos.map((photo, i) => (
                                        <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--surface-border)', aspectRatio: '4/3' }}>
                                            <a href={photo} target="_blank" rel="noreferrer">
                                                <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
