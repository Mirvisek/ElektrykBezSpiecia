import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Users, AlertTriangle, AlertCircle, Search, Plus, X, Phone, Mail, MapPin, Map, Calendar as CalendarIcon, FileText, Camera, CheckCircle, Edit, Trash2, UploadCloud } from 'lucide-react';
import { format, differenceInDays, addYears, addMonths } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export default function Clients() {
    const clients = useLiveQuery(() => db.clients.toArray());
    const sales = useLiveQuery(() => db.sales.toArray());

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'formal' | 'tech' | 'history' | 'finance' | 'map' | 'visits'>('formal');

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingClientId, setEditingClientId] = useState<number | null>(null);

    // Form states for new client (basic)
    const [cName, setCName] = useState('');
    const [cFirstName, setCFirstName] = useState('');
    const [cLastName, setCLastName] = useState('');
    const [cStreet, setCStreet] = useState('');
    const [cZip, setCZip] = useState('');
    const [cCity, setCCity] = useState('');
    const [cTax, setCTax] = useState('');
    const [cEmail, setCEmail] = useState('');
    const [cPhone, setCPhone] = useState('');
    const [cNotes, setCNotes] = useState('');
    const [cType, setCType] = useState<'company' | 'private' | 'community'>('company');

    // Active selected client reference
    const selectedClient = clients?.find(c => c.id === selectedClientId);

    // Share to ClientZone
    const [isSharing, setIsSharing] = useState(false);
    const [shareFile, setShareFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!shareFile) return alert("Wybierz plik z dysku.");
        if (!selectedClient?.email) return alert("Klient nie ma uzupełnionego adresu e-mail. Przejdź do edycji klienta i dopisz email, aby utworzyć mu konto w Strefie Klienta.");

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', shareFile);
        formData.append('email', selectedClient.email);
        formData.append('name', selectedClient.name);

        try {
            const res = await fetch('/api/client-files/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                alert("Plik udostępniony w Strefie Klienta. Jeśli klient nie miał tam konta, właśnie otrzymał powitalnego maila z hasłem.");
                setIsSharing(false);
                setShareFile(null);
            } else {
                alert("Błąd: " + data.message);
            }
        } catch (error) {
            alert("Błąd połączenia z serwerem.");
        } finally {
            setIsUploading(false);
        }
    };

    const enrichClientsWithStatus = useMemo(() => {
        if (!clients) return [];
        return clients.map(client => {
            let nextReviewDate = '';
            let daysUntil = 9999;
            let status: 'green' | 'yellow' | 'red' | 'unknown' = 'unknown';

            if (client.lastMeasurementDate && client.reviewIntervalYears) {
                const addY = parseInt((client.reviewIntervalYears as any), 10);
                const nextDate = addYears(new Date(client.lastMeasurementDate), addY);
                nextReviewDate = format(nextDate, 'yyyy-MM-dd');
                daysUntil = differenceInDays(nextDate, new Date());

                if (daysUntil < 0) {
                    status = 'red';
                } else if (daysUntil <= 30) {
                    status = 'yellow';
                } else {
                    status = 'green';
                }
            }
            return { ...client, nextReviewDate, daysUntil, status };
        });
    }, [clients]);

    const filteredClients = useMemo(() => {
        if (!searchTerm) return enrichClientsWithStatus;
        const lowSearch = searchTerm.toLowerCase();
        return enrichClientsWithStatus.filter(c =>
            c.name.toLowerCase().includes(lowSearch) ||
            (c.address && c.address.toLowerCase().includes(lowSearch)) ||
            (c.taxId && c.taxId.includes(lowSearch))
        );
    }, [enrichClientsWithStatus, searchTerm]);

    const countAll = enrichClientsWithStatus.length;
    const countWarning = enrichClientsWithStatus.filter(c => c.status === 'yellow').length;
    const countDanger = enrichClientsWithStatus.filter(c => c.status === 'red').length;

    const saveClient = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation - ensure we have a name
        if (cType !== 'private' && !cName) return;
        if (cType === 'private' && (!cFirstName || !cLastName)) return;

        const finalName = cType === 'private' ? `${cFirstName} ${cLastName}`.trim() : cName;
        const fullAddress = [cStreet, `${cZip} ${cCity}`.trim()].filter(Boolean).join(', ');

        const clientData = {
            name: finalName,
            firstName: cFirstName || undefined,
            lastName: cLastName || undefined,
            address: fullAddress,
            street: cStreet,
            postalCode: cZip,
            city: cCity,
            taxId: cTax,
            email: cEmail,
            phone: cPhone,
            notes: cNotes
        };

        if (editingClientId) {
            await db.clients.update(editingClientId, clientData as any);
        } else {
            await db.clients.add({
                ...clientData,
                protocols: []
            } as any);
        }

        resetForm();
    };

    const resetForm = () => {
        setCName(''); setCFirstName(''); setCLastName('');
        setCStreet(''); setCZip(''); setCCity(''); setCTax(''); setCEmail(''); setCPhone(''); setCNotes(''); setCType('company');
        setEditingClientId(null);
        setShowAddModal(false);
    };

    const openEditModal = (client: any) => {
        setEditingClientId(client.id);
        setCName(client.name || '');
        setCFirstName(client.firstName || '');
        setCLastName(client.lastName || '');
        setCStreet(client.street || '');
        setCZip(client.postalCode || '');
        setCCity(client.city || '');
        setCTax(client.taxId || '');
        setCEmail(client.email || '');
        setCPhone(client.phone || '');
        setCNotes(client.notes || '');

        if (client.firstName || client.lastName) {
            setCType('private');
        } else if (client.name?.toLowerCase().includes('wspólnota')) {
            setCType('community');
        } else {
            setCType('company');
        }

        setShowAddModal(true);
    };

    const deleteClient = async (id: number) => {
        if (window.confirm('Czy na pewno chcesz bezpowrotnie usunąć tego klienta i całą jego historię?')) {
            await db.clients.delete(id);
            setSelectedClientId(null);
        }
    };

    const fetchGus = async () => {
        if (!cTax) return;
        const nip = cTax.replace(/\D/g, '');
        if (nip.length !== 10) { alert('NIP musi mieć 10 cyfr'); return; }

        try {
            const date = new Date().toISOString().split('T')[0];
            const res = await fetch(`https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${date}`);
            const data = await res.json();
            if (data && data.result && data.result.subject) {
                setCName(data.result.subject.name);
            } else {
                alert('Nie znaleziono firmy w bazie GUS.');
            }
        } catch (e) {
            alert('Błąd połączenia z bazą GUS. Zapisz dane ręcznie.');
        }
    };

    const updateSelectedClient = async (updates: any) => {
        if (!selectedClientId) return;
        await db.clients.update(selectedClientId, updates);
    };

    // Auto-generator terminów
    const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null);
    const [isAddingProtocol, setIsAddingProtocol] = useState(false);
    const [newProtocolDate, setNewProtocolDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [newProtocolNumber, setNewProtocolNumber] = useState('');
    const [newProtocolResult, setNewProtocolResult] = useState('Pozytywne');
    const [newProtocolIssues, setNewProtocolIssues] = useState('');
    const [newProtocolFile, setNewProtocolFile] = useState<File | null>(null);
    const [newProtocolExistingFile, setNewProtocolExistingFile] = useState<{ name: string, data: string } | null>(null);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    const addNewProtocol = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) return;

        let fileData = newProtocolExistingFile?.data || null;
        let fileName = newProtocolExistingFile?.name || null;

        if (newProtocolFile) {
            fileData = await fileToBase64(newProtocolFile);
            fileName = newProtocolFile.name;
        }

        const p = {
            id: editingProtocolId || uuidv4(),
            date: newProtocolDate,
            number: newProtocolNumber,
            result: newProtocolResult,
            recommendations: newProtocolIssues,
            fileName: fileName,
            fileData: fileData
        };

        const existingProtocols = (selectedClient as any).protocols || [];

        let updatedProtocols;
        if (editingProtocolId) {
            updatedProtocols = existingProtocols.map((op: any) => op.id === editingProtocolId ? p : op);
            alert('Zmiany w protokole zostały zapisane.');
        } else {
            updatedProtocols = [...existingProtocols, p];
            // Auto dodanie do kalendarza jeśli klient ma interwał i dodajemy ZUPEŁNIE NOWY wpis
            if ((selectedClient as any).reviewIntervalYears) {
                const addY = parseInt(((selectedClient as any).reviewIntervalYears), 10);
                const nextDate = addYears(new Date(newProtocolDate), addY);
                // Przypomnienie miesiąc wcześniej
                const reminderDate = addMonths(nextDate, -1);

                await db.calendarEvents.add({
                    date: format(reminderDate, 'yyyy-MM-dd'),
                    title: `Przegląd za miesiąc (Interwał ${addY} lat)`,
                    description: `Pamiętaj aby zadzwonić do klienta i umówić się na przegląd (Termin upływa: ${format(nextDate, 'yyyy-MM-dd')})`,
                    clientName: selectedClient.name,
                    isCompleted: false
                });
                alert(`Dodano protokół! Automatycznie zaplanowano przypomnienie w kalendarzu na dzień: ${format(reminderDate, 'yyyy-MM-dd')}`);
            } else {
                alert('Dodano protokół! (Ustaw domyślny interwał przeglądów w profilu klienta, aby korzystać z auto-kalendarza)');
            }
        }

        // Update client
        await db.clients.update(selectedClientId!, {
            protocols: updatedProtocols,
            lastMeasurementDate: editingProtocolId ? (selectedClient as any).lastMeasurementDate : newProtocolDate
        } as any);

        cancelEditProtocol();
    };

    const cancelEditProtocol = () => {
        setEditingProtocolId(null);
        setIsAddingProtocol(false);
        setNewProtocolDate(format(new Date(), 'yyyy-MM-dd'));
        setNewProtocolNumber('');
        setNewProtocolIssues('');
        setNewProtocolFile(null);
        setNewProtocolExistingFile(null);
    };

    const openEditProtocol = (p: any) => {
        setEditingProtocolId(p.id);
        setIsAddingProtocol(true);
        setNewProtocolDate(p.date);
        setNewProtocolNumber(p.number);
        setNewProtocolResult(p.result);
        setNewProtocolIssues(p.recommendations || '');
        setNewProtocolFile(null);
        setNewProtocolExistingFile(p.fileName && p.fileData ? { name: p.fileName, data: p.fileData } : null);
    };

    const deleteProtocol = async (protocolId: string) => {
        if (!selectedClient) return;
        if (window.confirm('Czy na pewno chcesz usunąć ten protokół z historii?')) {
            const existingProtocols = (selectedClient as any).protocols || [];
            await db.clients.update(selectedClient.id!, {
                protocols: existingProtocols.filter((p: any) => p.id !== protocolId)
            } as any);
        }
    };

    // --- Sekcja Wizyt ---
    const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
    const [isAddingVisit, setIsAddingVisit] = useState(false);
    const [expandedVisits, setExpandedVisits] = useState<string[]>([]);
    const [vDate, setVDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    const [vType, setVType] = useState('Pomiary okresowe (5-letnie)');
    const [vStatus, setVStatus] = useState('W toku');
    const [vTime, setVTime] = useState('');
    const [vMeters, setVMeters] = useState('');
    const [vIssues, setVIssues] = useState('');
    const [vPointsRiso, setVPointsRiso] = useState('');
    const [vPointsLoop, setVPointsLoop] = useState('');
    const [vPointsRCD, setVPointsRCD] = useState('');
    const [vVerdict, setVVerdict] = useState('Pozytywny');
    const [vChecks, setVChecks] = useState({
        ogl: false,
        ciag: false,
        rcd: false,
        info: false
    });

    const vToggleCheck = (k: keyof typeof vChecks) => {
        setVChecks(prev => ({ ...prev, [k]: !prev[k] }));
    };

    const toggleExpandVisit = (id: string) => {
        setExpandedVisits(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const addVisit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) return;

        const newVisit = {
            id: editingVisitId || uuidv4(),
            date: vDate,
            type: vType,
            status: vStatus,
            time: vTime,
            notes: {
                meters: vMeters,
                issues: vIssues,
                verdict: vVerdict,
                points: {
                    riso: vPointsRiso,
                    loop: vPointsLoop,
                    rcd: vPointsRCD
                }
            },
            checks: vChecks
        };

        const existingVisits = (selectedClient as any).visits || [];

        let newVisits;
        if (editingVisitId) {
            newVisits = existingVisits.map((v: any) => v.id === editingVisitId ? newVisit : v);
            alert('Zmiany w wizycie zostały zapisane!');
        } else {
            newVisits = [...existingVisits, newVisit];
            alert('Zapisano nową wizytę w historii obiektu!');
        }

        await db.clients.update(selectedClientId!, {
            visits: newVisits
        } as any);

        cancelEditVisit();
    };

    const cancelEditVisit = () => {
        setEditingVisitId(null);
        setIsAddingVisit(false);
        setVDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
        setVType('Pomiary okresowe (5-letnie)');
        setVStatus('W toku');
        setVTime('');
        setVMeters('');
        setVIssues('');
        setVPointsRiso('');
        setVPointsLoop('');
        setVPointsRCD('');
        setVVerdict('Pozytywny');
        setVChecks({ ogl: false, ciag: false, rcd: false, info: false });
    };

    const openEditVisit = (v: any) => {
        if (v.status === 'Zakończona') {
            if (!window.confirm('Ta wizyta ma status "Zakończona" i trafiła do historii. Czy na pewno chcesz odblokować ją do ponownej edycji?')) return;
        }
        setEditingVisitId(v.id);
        setIsAddingVisit(true);
        setVDate(v.date);
        setVType(v.type);
        setVStatus(v.status);
        setVTime(v.time || '');
        setVMeters(v.notes?.meters || '');
        setVIssues(v.notes?.issues || '');
        setVPointsRiso(v.notes?.points?.riso || '');
        setVPointsLoop(v.notes?.points?.loop || '');
        setVPointsRCD(v.notes?.points?.rcd || '');
        setVVerdict(v.notes?.verdict || 'Pozytywny');
        setVChecks(v.checks || { ogl: false, ciag: false, rcd: false, info: false });

        setActiveTab('visits');
    };

    const deleteVisit = async (visitId: string) => {
        if (!selectedClient) return;
        if (window.confirm('Czy na pewno chcesz usunąć ten wpis z historii wizyt?')) {
            const existingVisits = (selectedClient as any).visits || [];
            await db.clients.update(selectedClient.id!, {
                visits: existingVisits.filter((v: any) => v.id !== visitId)
            } as any);
        }
    };

    return (
        <div className="container">
            {/* Top Control Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1>Klienci CRM</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Inteligentna baza klientów dla twoich usług instalacyjnych.</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
                    <Plus size={18} /> Dodaj klienta
                </button>
            </div>

            {/* Status Cards */}
            <div className="grid grid-3" style={{ marginBottom: '24px' }}>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
                    <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '50%' }}>
                        <Users color="var(--primary-color)" size={24} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Wszyscy klienci</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{countAll}</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
                    <div style={{ background: '#fef9c3', padding: '12px', borderRadius: '50%' }}>
                        <AlertTriangle color="#eab308" size={24} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Wymagają kontroli (30 dni)</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ca8a04' }}>{countWarning}</div>
                    </div>
                </div>
                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px' }}>
                    <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '50%' }}>
                        <AlertCircle color="#ef4444" size={24} />
                    </div>
                    <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Przeterminowane przeglądy</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b91c1c' }}>{countDanger}</div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', gap: '16px', alignItems: 'center', background: '#f9fafb' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                        <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Szukaj po nazwie, adresie, NIP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ paddingLeft: '36px', background: '#fff' }}
                        />
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px', textAlign: 'center' }}>Stan</th>
                            <th>Nazwa i Adres Obiektu</th>
                            <th>Ostatni Pomiar</th>
                            <th>Nast. Przegląd</th>
                            <th style={{ textAlign: 'right' }}>Szybki Kontakt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClients.map(c => (
                            <tr key={c.id} onClick={() => setSelectedClientId(c.id!)} style={{ cursor: 'pointer' }}>
                                <td style={{ textAlign: 'center' }}>
                                    <span className={`status-dot dot-${c.status === 'unknown' ? 'green' : c.status}`}></span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#111827' }}>{c.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={12} /> {c.address || 'Brak adresu'}
                                    </div>
                                </td>
                                <td style={{ color: 'var(--text-muted)' }}>{(c as any).lastMeasurementDate || 'Brak danych'}</td>
                                <td>
                                    {c.nextReviewDate ? (
                                        <span style={{ fontWeight: c.status !== 'green' ? 600 : 400, color: c.status === 'red' ? 'var(--danger-color)' : c.status === 'yellow' ? 'var(--warning-color)' : 'inherit' }}>
                                            {c.nextReviewDate}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                    {(c as any).phone ? (
                                        <a href={`tel:${(c as any).phone}`} onClick={e => e.stopPropagation()} style={{ marginRight: '12px', color: 'var(--text-muted)' }}>
                                            <Phone size={18} />
                                        </a>
                                    ) : null}
                                    {c.email ? (
                                        <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--text-muted)' }}>
                                            <Mail size={18} />
                                        </a>
                                    ) : null}
                                </td>
                            </tr>
                        ))}
                        {filteredClients.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    Brak wyników.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Slide Out Panel */}
            <div className={`slide-panel-overlay ${selectedClientId ? 'open' : ''}`} onClick={() => setSelectedClientId(null)}></div>
            <div className={`slide-panel ${selectedClientId ? 'open' : ''}`}>
                {selectedClient && (
                    <>
                        <div className="slide-header">
                            <div>
                                <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{selectedClient.name}</h2>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedClient.address}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-outline" title="Strefa Klienta (Udostępnij plik do chmury)" onClick={() => setIsSharing(true)} style={{ padding: '8px', color: '#10b981', borderColor: '#10b981' }}>
                                    <UploadCloud size={20} />
                                </button>
                                <button className="btn btn-outline" title="Edytuj dane podstawowe" onClick={() => openEditModal(selectedClient)} style={{ padding: '8px', color: 'var(--primary-color)' }}>
                                    <Edit size={20} />
                                </button>
                                <button className="btn btn-outline" title="Usuń klienta" onClick={() => deleteClient(selectedClient.id!)} style={{ padding: '8px', color: 'var(--danger-color)' }}>
                                    <Trash2 size={20} />
                                </button>
                                <button className="btn btn-outline" title="Zamknij panel" onClick={() => setSelectedClientId(null)} style={{ padding: '8px' }}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '0 24px', background: '#f9fafb', borderBottom: '1px solid var(--surface-border)' }}>
                            <div className="crm-tabs" style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '4px' }}>
                                <div className={`crm-tab ${activeTab === 'formal' ? 'active' : ''}`} onClick={() => setActiveTab('formal')}>Dane</div>
                                <div className={`crm-tab ${activeTab === 'tech' ? 'active' : ''}`} onClick={() => setActiveTab('tech')}>Techniczne</div>
                                <div className={`crm-tab ${activeTab === 'visits' ? 'active' : ''}`} onClick={() => setActiveTab('visits')}>Wizyty (Teren)</div>
                                <div className={`crm-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Protokoły</div>
                                <div className={`crm-tab ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>Finanse</div>
                                <div className={`crm-tab ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>Mapa</div>
                            </div>
                        </div>

                        <div className="slide-content">
                            {/* Fotka i Krótka notatka quick view zawsze na górze */}
                            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                <div style={{ width: '100px', height: '100px', background: '#e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                                    <Camera size={32} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.75rem' }}>Szybka notatka o obiekcie (klucze, dojazd):</label>
                                    <textarea
                                        rows={3}
                                        value={(selectedClient as any).notes || ''}
                                        onChange={(e) => updateSelectedClient({ notes: e.target.value })}
                                        placeholder="Np. klucze u dozorcy, uwaga na psa..."
                                        style={{ fontSize: '0.85rem', padding: '8px', background: '#f9fafb' }}
                                    />
                                </div>
                            </div>

                            {activeTab === 'formal' && (
                                <div className="grid grid-2" style={{ gap: '8px' }}>
                                    <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '4px' }}>
                                        <label>Pełna nazwa (do rachunku)</label>
                                        <input type="text" value={selectedClient.name} onChange={e => updateSelectedClient({ name: e.target.value })} />
                                    </div>
                                    {(selectedClient.firstName || selectedClient.lastName) && (
                                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                                <label>Imię</label>
                                                <input type="text" value={selectedClient.firstName || ''} onChange={e => updateSelectedClient({ firstName: e.target.value, name: `${e.target.value} ${selectedClient.lastName || ''}`.trim() })} />
                                            </div>
                                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                                <label>Nazwisko</label>
                                                <input type="text" value={selectedClient.lastName || ''} onChange={e => updateSelectedClient({ lastName: e.target.value, name: `${selectedClient.firstName || ''} ${e.target.value}`.trim() })} />
                                            </div>
                                        </div>
                                    )}
                                    <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '4px' }}>
                                        <label>Ulica i nr budynku/lokalu</label>
                                        <input type="text" value={selectedClient.street || ''} onChange={e => updateSelectedClient({ street: e.target.value, address: [e.target.value, `${selectedClient.postalCode || ''} ${selectedClient.city || ''}`.trim()].filter(Boolean).join(', ') })} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '4px' }}>
                                        <label>Kod pocztowy</label>
                                        <input type="text" value={selectedClient.postalCode || ''} onChange={e => updateSelectedClient({ postalCode: e.target.value, address: [selectedClient.street || '', `${e.target.value} ${selectedClient.city || ''}`.trim()].filter(Boolean).join(', ') })} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '4px' }}>
                                        <label>Miejscowość</label>
                                        <input type="text" value={selectedClient.city || ''} onChange={e => updateSelectedClient({ city: e.target.value, address: [selectedClient.street || '', `${selectedClient.postalCode || ''} ${e.target.value}`.trim()].filter(Boolean).join(', ') })} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '4px' }}>
                                        <label>NIP / PESEL</label>
                                        <input type="text" value={selectedClient.taxId || ''} onChange={e => updateSelectedClient({ taxId: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '4px' }}>
                                        <label>Telefon</label>
                                        <input type="text" value={(selectedClient as any).phone || ''} onChange={e => updateSelectedClient({ phone: e.target.value })} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2', marginBottom: '4px' }}>
                                        <label>E-mail</label>
                                        <input type="email" value={selectedClient.email || ''} onChange={e => updateSelectedClient({ email: e.target.value })} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'tech' && (
                                <div className="grid grid-2" style={{ gap: '16px' }}>
                                    <div className="form-group">
                                        <label>Typ układu sieci</label>
                                        <select value={(selectedClient as any).networkType || ''} onChange={e => updateSelectedClient({ networkType: e.target.value })}>
                                            <option value="">Wybierz...</option>
                                            <option value="TN-S">TN-S</option>
                                            <option value="TN-C">TN-C</option>
                                            <option value="TN-C-S">TN-C-S</option>
                                            <option value="TT">TT</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Zabezp. przedlicznikowe</label>
                                        <input type="text" placeholder="np. C25/3" value={(selectedClient as any).preMeterProtection || ''} onChange={e => updateSelectedClient({ preMeterProtection: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Liczba obwodów pomiarowych</label>
                                        <input type="number" placeholder="np. 12" value={(selectedClient as any).circuitsCount || ''} onChange={e => updateSelectedClient({ circuitsCount: parseInt(e.target.value) || '' })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Typ uziomu</label>
                                        <select value={(selectedClient as any).earthingType || ''} onChange={e => updateSelectedClient({ earthingType: e.target.value })}>
                                            <option value="">Wybierz...</option>
                                            <option value="Fundamentowy">Fundamentowy</option>
                                            <option value="Otokowy">Otokowy</option>
                                            <option value="Szpilkowy">Szpilkowy</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Rezystancja uziemienia (ostatnia)</label>
                                        <input type="text" placeholder="np. 8.5 Ω" value={(selectedClient as any).lastEarthResistance || ''} onChange={e => updateSelectedClient({ lastEarthResistance: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Interwał przeglądów (Lata)</label>
                                        <select value={(selectedClient as any).reviewIntervalYears || ''} onChange={e => updateSelectedClient({ reviewIntervalYears: e.target.value })}>
                                            <option value="">Nie zdefiniowano</option>
                                            <option value="1">1 Rok (Zagrożenie wybuchem/Budowa)</option>
                                            <option value="5">5 Lat (Standard - normy PB)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'visits' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Zarządzanie wizytami u klienta</h3>
                                        {!isAddingVisit && !editingVisitId && (
                                            <button className="btn btn-primary" onClick={() => setIsAddingVisit(true)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                                <Plus size={16} /> Dodaj wizytę
                                            </button>
                                        )}
                                    </div>

                                    {(isAddingVisit || editingVisitId) && (
                                        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--surface-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                                                    {editingVisitId ? 'Edytuj notatkę z wizyty' : 'Nowa wizyta (Teren)'}
                                                </h3>
                                                <button className="btn btn-outline" onClick={cancelEditVisit} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                                            </div>
                                            <form onSubmit={addVisit}>
                                                <div className="grid grid-2" style={{ gap: '16px' }}>
                                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                        <label>Cel wizyty (Typ)</label>
                                                        <select value={vType} onChange={e => setVType(e.target.value)}>
                                                            <option value="Pomiary okresowe (5-letnie)">Pomiary okresowe (5-letnie)</option>
                                                            <option value="Odbiór nowej instalacji">Odbiór nowej instalacji</option>
                                                            <option value="Usunięcie awarii">Usunięcie awarii</option>
                                                            <option value="Oględziny / Wycena">Oględziny / Wycena</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Data i Godzina</label>
                                                        <input type="datetime-local" value={vDate} onChange={e => setVDate(e.target.value)} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Czas pracy (h)</label>
                                                        <input type="number" step="0.5" placeholder="np. 2.5" value={vTime} onChange={e => setVTime(e.target.value)} />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Status</label>
                                                        <select value={vStatus} onChange={e => setVStatus(e.target.value)}>
                                                            <option value="W toku">W toku</option>
                                                            <option value="Oczekiwanie na materiały">Oczekiwanie na materiały</option>
                                                            <option value="Zakończona">Zakończona</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Orzeczenie wstępne</label>
                                                        <select value={vVerdict} onChange={e => setVVerdict(e.target.value)}>
                                                            <option value="Pozytywny">Pozytywny</option>
                                                            <option value="Pozytywny po usunięciu usterek">Pozytywny po usunięciu usterek</option>
                                                            <option value="Negatywny">Negatywny</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <h4 style={{ fontSize: '0.9rem', marginTop: '16px', marginBottom: '8px', color: 'var(--primary-color)' }}>Notatka do przygotowania protokołu</h4>

                                                <div className="form-group">
                                                    <label>Dane z miernika (Szybki szkic)</label>
                                                    <textarea rows={2} placeholder="np. Gniazdo kuchnia - Zsw 0,45 Ohm..." value={vMeters} onChange={e => setVMeters(e.target.value)} />
                                                </div>

                                                <div className="form-group">
                                                    <label>Stwierdzone usterki (Zalecenia)</label>
                                                    <textarea rows={2} placeholder="np. Brak osłony w rozdzielnicy, upalone styki..." value={vIssues} onChange={e => setVIssues(e.target.value)} />
                                                </div>

                                                <div className="grid grid-3" style={{ gap: '8px', marginBottom: '16px' }}>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label style={{ fontSize: '0.75rem' }}>Punkty Riso</label>
                                                        <input type="number" placeholder="0" value={vPointsRiso} onChange={e => setVPointsRiso(e.target.value)} />
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label style={{ fontSize: '0.75rem' }}>Pętle zwarcia</label>
                                                        <input type="number" placeholder="0" value={vPointsLoop} onChange={e => setVPointsLoop(e.target.value)} />
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label style={{ fontSize: '0.75rem' }}>Ilość RCD</label>
                                                        <input type="number" placeholder="0" value={vPointsRCD} onChange={e => setVPointsRCD(e.target.value)} />
                                                    </div>
                                                </div>

                                                <h4 style={{ fontSize: '0.9rem', marginTop: '16px', marginBottom: '8px' }}>Dokumentacja fotograficzna</h4>
                                                <div style={{ padding: '24px', border: '1px dashed var(--surface-border)', borderRadius: '8px', textAlign: 'center', marginBottom: '16px', background: '#fff', cursor: 'pointer' }}>
                                                    <Camera size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kliknij aby zrobić zdjęcie lub wgrać (np. usterki, rozdzielnicy)</div>
                                                </div>

                                                <h4 style={{ fontSize: '0.9rem', marginTop: '16px', marginBottom: '8px' }}>Checklisty (Na miejscu)</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                                                    {Object.entries({
                                                        ogl: 'Oględziny wykonane?',
                                                        ciag: 'Ciągłość przewodów sprawdzona?',
                                                        rcd: 'RCD przetestowane TEST?',
                                                        info: 'Klient poinformowany o naprawach?'
                                                    }).map(([k, label]) => (
                                                        <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: '8px', background: '#fff', borderRadius: '4px', border: '1px solid var(--surface-border)', cursor: 'pointer' }}>
                                                            <input type="checkbox" checked={(vChecks as any)[k]} onChange={() => vToggleCheck(k as any)} style={{ width: 'auto' }} />
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 400 }}>{label}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
                                                    <CheckCircle size={16} /> {editingVisitId ? 'Zapisz zmiany w wizycie' : 'Zapisz Wizytę'}
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    {(() => {
                                        const allVisits = ((selectedClient as any).visits || []).slice().reverse();
                                        const inProgress = allVisits.filter((v: any) => v.status !== 'Zakończona');
                                        const history = allVisits.filter((v: any) => v.status === 'Zakończona');

                                        return (
                                            <>
                                                {inProgress.length > 0 && (
                                                    <div style={{ marginBottom: '32px' }}>
                                                        <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--warning-color)', paddingBottom: '8px' }}>
                                                            <div className="status-dot dot-yellow"></div> <strong>W trakcie</strong> ({inProgress.length})
                                                        </h4>
                                                        {inProgress.map((v: any) => (
                                                            <div key={v.id} style={{ padding: '16px', border: '1px solid #fcd34d', borderRadius: '8px', marginBottom: '12px', background: 'rgba(251, 191, 36, 0.05)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-start' }}>
                                                                    <div>
                                                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', marginBottom: '4px' }}>
                                                                            <CalendarIcon size={18} style={{ color: 'var(--warning-color)' }} />
                                                                            {format(new Date(v.date), 'dd.MM.yyyy HH:mm')} - {v.type}
                                                                        </strong>
                                                                        <span className={`badge badge-${v.status === 'W toku' ? 'blue' : 'danger'}`}>
                                                                            {v.status}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--primary-color)' }} onClick={() => openEditVisit(v)} title="Kontynuuj / Edytuj">
                                                                            <Edit size={14} /> Edytuj
                                                                        </button>
                                                                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--danger-color)' }} onClick={() => deleteVisit(v.id)} title="Usuń trwale">
                                                                            <Trash2 size={14} /> Usuń
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', gap: '16px' }}>
                                                                    <span>⏱ Czas dotychczas: {v.time ? `${v.time}h` : '0h'}</span>
                                                                    <span>⚖️ Orzeczenie: <strong style={{ color: v.notes.verdict === 'Pozytywny' ? 'var(--success-color)' : v.notes.verdict === 'Negatywny' ? 'var(--danger-color)' : 'var(--warning-color)' }}>{v.notes.verdict}</strong></span>
                                                                </div>

                                                                {(v.notes.meters || v.notes.issues) && (
                                                                    <div style={{ background: '#fff', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px', border: '1px dashed var(--surface-border)' }}>
                                                                        {v.notes.meters && <div style={{ marginBottom: '8px' }}><strong>Szkic z miernika:</strong> <br />{v.notes.meters}</div>}
                                                                        {v.notes.issues && <div style={{ color: 'var(--danger-color)' }}><strong>Usterki (W trakcie):</strong> <br />{v.notes.issues}</div>}
                                                                    </div>
                                                                )}

                                                                <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                    <span style={{ background: '#fff', padding: '4px 8px', border: '1px solid var(--surface-border)', borderRadius: '4px' }}>Riso: <b>{v.notes.points.riso || 0}</b></span>
                                                                    <span style={{ background: '#fff', padding: '4px 8px', border: '1px solid var(--surface-border)', borderRadius: '4px' }}>Zsw: <b>{v.notes.points.loop || 0}</b></span>
                                                                    <span style={{ background: '#fff', padding: '4px 8px', border: '1px solid var(--surface-border)', borderRadius: '4px' }}>RCD: <b>{v.notes.points.rcd || 0}</b></span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {history.length > 0 && (
                                                    <div>
                                                        <h4 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid var(--success-color)', paddingBottom: '8px' }}>
                                                            <div className="status-dot dot-green"></div> <strong>Historia zakończonych prac</strong> ({history.length})
                                                        </h4>
                                                        {history.map((v: any) => {
                                                            const isExpanded = expandedVisits.includes(v.id);
                                                            return (
                                                                <div key={v.id} style={{ padding: '12px 16px', border: '1px solid var(--surface-border)', borderRadius: '8px', marginBottom: '8px', background: '#fff' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleExpandVisit(v.id)}>
                                                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                                                            <CheckCircle size={16} style={{ color: 'var(--success-color)' }} />
                                                                            {format(new Date(v.date), 'dd.MM.yyyy')} - {v.type}
                                                                        </strong>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                            <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600 }}>{isExpanded ? ' Ukryj szczegóły' : 'Pokaż szczegóły'}</span>
                                                                        </div>
                                                                    </div>

                                                                    {isExpanded && (
                                                                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--surface-border)' }}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                                                <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>ZAKOŃCZONA</span>
                                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--primary-color)' }} onClick={() => openEditVisit(v)} title="Odblokuj edycję">
                                                                                        <Edit size={12} /> Odblokuj edycję
                                                                                    </button>
                                                                                    <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger-color)' }} onClick={() => deleteVisit(v.id)} title="Usuń z historii">
                                                                                        <Trash2 size={12} /> Usuń
                                                                                    </button>
                                                                                </div>
                                                                            </div>

                                                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px', display: 'flex', gap: '16px' }}>
                                                                                <span>⏱ Przepracowany czas: <strong>{v.time ? `${v.time}h` : '?'}</strong></span>
                                                                                <span>⚖️ Orzeczenie: <strong style={{ color: v.notes.verdict === 'Pozytywny' ? 'var(--success-color)' : v.notes.verdict === 'Negatywny' ? 'var(--danger-color)' : 'var(--warning-color)' }}>{v.notes.verdict}</strong></span>
                                                                            </div>

                                                                            {(v.notes.meters || v.notes.issues) && (
                                                                                <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '12px' }}>
                                                                                    {v.notes.meters && <div style={{ marginBottom: '8px', color: 'var(--text-main)' }}><strong>Wyniki pomiarów (notatka):</strong> <br />{v.notes.meters}</div>}
                                                                                    {v.notes.issues && <div style={{ color: 'var(--danger-color)' }}><strong>Wykryte Usterki / Zalecenia:</strong> <br />{v.notes.issues}</div>}
                                                                                </div>
                                                                            )}

                                                                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                                                <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>Riso: <b>{v.notes.points.riso || 0}</b></span>
                                                                                <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>Zsw: <b>{v.notes.points.loop || 0}</b></span>
                                                                                <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>RCD: <b>{v.notes.points.rcd || 0}</b></span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {allVisits.length === 0 && !isAddingVisit && !editingVisitId && (
                                                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px 32px', border: '2px dashed var(--surface-border)', borderRadius: '12px', background: '#f9fafb' }}>
                                                        <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.5 }} />
                                                        <br />
                                                        Brak jakichkolwiek zarejestrowanych działań i wizyt na tym obiekcie.
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Protokoły instalacji</h3>
                                        {!isAddingProtocol && (
                                            <button className="btn btn-primary" onClick={() => setIsAddingProtocol(true)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                                <Plus size={16} /> Dodaj protokół
                                            </button>
                                        )}
                                    </div>

                                    {isAddingProtocol && (
                                        <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '32px', border: '1px solid var(--surface-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <CalendarIcon size={18} color="var(--primary-color)" /> {editingProtocolId ? 'Edytuj formularz protokołu' : 'Rejestracja nowego protokołu'}
                                                </h3>
                                                <button className="btn btn-outline" onClick={cancelEditProtocol} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Anuluj</button>
                                            </div>
                                            <form onSubmit={addNewProtocol}>
                                                <div className="grid grid-2" style={{ gap: '16px' }}>
                                                    <div className="form-group">
                                                        <label>Data wykonania</label>
                                                        <input type="date" value={newProtocolDate} onChange={e => setNewProtocolDate(e.target.value)} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Nr protokołu</label>
                                                        <input type="text" placeholder="np. P-01/2026" value={newProtocolNumber} onChange={e => setNewProtocolNumber(e.target.value)} required />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Orzeczenie ogólne</label>
                                                        <select value={newProtocolResult} onChange={e => setNewProtocolResult(e.target.value)}>
                                                            <option value="Pozytywne">Pozytywne</option>
                                                            <option value="Negatywne">Negatywne</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                        <label>Zalecenia i usterki</label>
                                                        <input type="text" placeholder="np. Brak opisów aparatów, uszkodzone RCD" value={newProtocolIssues} onChange={e => setNewProtocolIssues(e.target.value)} />
                                                    </div>
                                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                                        <label>Modyfikuj plik protokołu (PDF/Zdjęcie z urządzenia)</label>
                                                        {newProtocolExistingFile && !newProtocolFile && (
                                                            <div style={{ marginBottom: '8px', fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                                                                Obecnie załączono: <b>{newProtocolExistingFile.name}</b>
                                                            </div>
                                                        )}
                                                        <input type="file" onChange={e => setNewProtocolFile(e.target.files ? e.target.files[0] : null)} />
                                                    </div>
                                                </div>
                                                <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
                                                    <CheckCircle size={16} /> {editingProtocolId ? 'Zapisz zamiany' : 'Zapisz w historii i stwórz auto-przypomnienie'}
                                                </button>
                                            </form>
                                        </div>
                                    )}

                                    <h3 style={{ fontSize: '1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={18} color="var(--text-muted)" /> Historia wpisów
                                    </h3>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {((selectedClient as any).protocols || []).length === 0 && <p style={{ color: 'var(--text-muted)' }}>Brak zarejestrowanych protokołów.</p>}
                                        {((selectedClient as any).protocols || []).slice().reverse().map((p: any) => (
                                            <li key={p.id} style={{ padding: '16px', border: '1px solid var(--surface-border)', borderRadius: '8px', marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <strong style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span className={`status-dot dot-${p.result === 'Pozytywne' ? 'green' : 'red'}`}></span>
                                                        Protokół nr {p.number}
                                                    </strong>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.date}</span>
                                                        <button className="btn btn-outline" style={{ padding: '2px 6px', fontSize: '0.75rem', color: 'var(--primary-color)' }} onClick={() => openEditProtocol(p)} title="Edytuj">
                                                            <Edit size={12} />
                                                        </button>
                                                        <button className="btn btn-outline" style={{ padding: '2px 6px', fontSize: '0.75rem', color: 'var(--danger-color)' }} onClick={() => deleteProtocol(p.id)} title="Usuń">
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '0.85rem' }}>
                                                    {p.recommendations ? (
                                                        <span><span style={{ color: 'var(--danger-color)' }}>Uwagi:</span> {p.recommendations}</span>
                                                    ) : (
                                                        <span style={{ color: 'var(--success-color)' }}>Brak uwag. Instalacja nadaje się do eksploatacji.</span>
                                                    )}
                                                </div>
                                                {p.fileName && p.fileData && (
                                                    <div style={{ marginTop: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)' }}>
                                                        <FileText size={14} /> Załączono:
                                                        <a href={p.fileData} download={p.fileName} style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'underline' }}>
                                                            {p.fileName}
                                                        </a>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {activeTab === 'finance' && (() => {
                                const clientSales = sales?.filter(s => s.clientName === selectedClient.name) || [];
                                const total = clientSales.reduce((sum, s) => sum + s.amount, 0);

                                return (
                                    <div>
                                        <div style={{ textAlign: 'center', padding: '32px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1', marginBottom: '24px' }}>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Wygenerowany Przychód od tego klienta</div>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{total.toFixed(2)} zł</div>
                                        </div>

                                        <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Wystawione Rachunki do klienta:</h3>
                                        <ul style={{ listStyle: 'none', padding: 0 }}>
                                            {clientSales.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Brak powiązanych rachunków.</p>}
                                            {clientSales.map(s => (
                                                <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--surface-border)' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{s.documentNumber}</div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.date} - {s.serviceName}</div>
                                                    </div>
                                                    <div style={{ fontWeight: 700 }}>
                                                        {s.amount.toFixed(2)} zł
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })()}

                            {activeTab === 'map' && (
                                <div>
                                    <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--surface-border)', position: 'relative' }}>
                                        {selectedClient.address ? (
                                            <iframe
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                style={{ border: 0 }}
                                                src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedClient.address)}&output=embed`}
                                                allowFullScreen>
                                            </iframe>
                                        ) : (
                                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', background: '#f9fafb' }}>
                                                <Map size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                                Aby zobaczyć mapę, wypełnij "Adres kompletny" w zakładce "Formalne".
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                        {/* Szablon SMS (Smart function) */}
                                        <a href={`sms:${(selectedClient as any).phone || ''}?body=Dzień dobry, z tej strony ${encodeURIComponent('Twoj Elektryk')}. Przypominam, że w ciągu 14 dni upływa ważność okresowego przeglądu instalacji elektrycznej pod Państwa adresem. Proszę o kontakt w celu umówienia terminu.`} className="btn btn-outline" style={{ display: 'inline-flex', width: 'auto' }}>
                                            <Phone size={16} /> Wyślij auto-przypomnienie SMS
                                        </a>
                                        <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedClient.address)}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto', gap: '8px', marginLeft: '12px' }}>
                                            <MapPin size={16} /> Prowadź do
                                        </a>
                                    </div>
                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>

            {/* Nowy Klient Modal (Simple) */}
            {
                showAddModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.25rem' }}>{editingClientId ? 'Edytuj Klienta' : 'Nowy Klient'}</h2>
                                <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={saveClient} style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '8px' }}>
                                <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--primary-color)' }}>Krok 1: Dane Podstawowe</h3>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
                                    {['private', 'company', 'community'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => { setCType(type as any); setCName(''); setCFirstName(''); setCLastName(''); setCTax(''); }}
                                            style={{ flex: 1, padding: '8px', border: 'none', background: cType === type ? '#fff' : 'transparent', borderRadius: '6px', cursor: 'pointer', fontWeight: cType === type ? 600 : 400, boxShadow: cType === type ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                                            {type === 'private' ? 'Prywatna' : type === 'company' ? 'Firma' : 'Wspólnota'}
                                        </button>
                                    ))}
                                </div>

                                {cType !== 'private' && (
                                    <div className="form-group">
                                        <label>NIP {cType === 'company' ? 'Firmy' : 'Wspólnoty'}</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="text" placeholder="Wpisz i pobierz z GUS" value={cTax} onChange={e => setCTax(e.target.value)} />
                                            <button type="button" className="btn btn-outline" onClick={fetchGus} style={{ whiteSpace: 'nowrap' }}>Pobierz z GUS</button>
                                        </div>
                                    </div>
                                )}

                                {cType !== 'private' && (
                                    <div className="form-group">
                                        <label>Nazwa {cType === 'company' ? 'firmy' : 'wspólnoty'}</label>
                                        <input type="text" placeholder="np. Klonowa 5 (Z GUS lub ręcznie)" value={cName} onChange={e => setCName(e.target.value)} required />
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Imię {cType !== 'private' ? '(kontakt)' : ''}</label>
                                        <input type="text" placeholder="np. Jan" value={cFirstName} onChange={e => setCFirstName(e.target.value)} required={cType === 'private'} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Nazwisko</label>
                                        <input type="text" placeholder="np. Kowalski" value={cLastName} onChange={e => setCLastName(e.target.value)} required={cType === 'private'} />
                                    </div>
                                </div>

                                {cType === 'private' && (
                                    <div className="form-group">
                                        <label>PESEL (opcjonalnie)</label>
                                        <input type="text" placeholder="Wymagane tylko do rachunków" value={cTax} onChange={e => setCTax(e.target.value)} />
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>E-mail</label>
                                        <input type="email" placeholder="Do wysyłki protokołów w PDF" value={cEmail} onChange={e => setCEmail(e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Telefon</label>
                                        <input type="tel" placeholder="Nr do kontaktu" value={cPhone} onChange={e => setCPhone(e.target.value)} />
                                    </div>
                                </div>

                                <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid var(--surface-border)' }} />
                                <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--primary-color)' }}>Krok 2: Lokalizacja Obiektu</h3>

                                <div className="form-group">
                                    <label>Adres instalacji (ulica i dom/lokal)</label>
                                    <input type="text" placeholder="Gdzie jedziesz? np. ul. Klonowa 5/12" value={cStreet} onChange={e => setCStreet(e.target.value)} />
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div className="form-group" style={{ width: '120px' }}>
                                        <label>Kod pocztowy</label>
                                        <input type="text" placeholder="np. 00-000" value={cZip} onChange={e => setCZip(e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Miejscowość</label>
                                        <input type="text" placeholder="np. Warszawa" value={cCity} onChange={e => setCCity(e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Notatka dotycząca dojazdu</label>
                                    <textarea
                                        rows={2}
                                        placeholder="np. Trzecia brama za sklepem, Kod do domofonu #123"
                                        value={cNotes}
                                        onChange={e => setCNotes(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)', fontFamily: 'inherit', fontSize: '0.9rem' }}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                                    {editingClientId ? 'Zapisz zmiany' : 'Zapisz w bazie'}
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Modal Udostępniania do Chmury (Strefa Klienta) */}
            {isSharing && selectedClient && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <UploadCloud size={24} /> Udostępnij dokument
                            </h2>
                            <button onClick={() => { setIsSharing(false); setShareFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            Twoja aplikacja u mnie wygeneruje bezpieczne konto typu "<b>CLIENT</b>" i wyśle hasło do użytkownika automatycznie jeśli tego dotychczas nie zrobiono.<br /><br />
                            Zostanie przypisane do adresu email: <b>{selectedClient.email || <span style={{ color: 'red' }}>BRAK E-MAIL (wymagane uzupełnienie)</span>}</b>
                        </p>

                        <form onSubmit={handleShare}>
                            <div className="form-group">
                                <label>Wybierz plik (PDF, JPG... z Protokołem lub Ofertą)</label>
                                <input type="file" required onChange={e => setShareFile(e.target.files ? e.target.files[0] : null)} style={{ padding: '16px', border: '2px dashed var(--surface-border)', width: '100%', borderRadius: '8px' }} />
                                {shareFile && <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-main)', background: '#f3f4f6', padding: '8px', borderRadius: '6px' }}>Pamiętaj: Plik zostanie wrzucony do Bezpiecznej Strefy Klienta od razu.</div>}
                            </div>
                            <button type="submit" disabled={isUploading || !selectedClient.email} className="btn btn-primary" style={{ width: '100%', marginTop: '16px', background: isUploading ? 'grey' : '#10b981', borderColor: isUploading ? 'grey' : '#10b981' }}>
                                {isUploading ? 'Wgrywam i wysyłam...' : 'Wyślij Dokument do Klienta'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
}
