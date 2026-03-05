"use client";

import { useState } from "react";
import { UserPlus, Key, Mail, Trash2, ArrowLeft, X, Save, ShieldCheck, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { addUser, updateUser, deleteUser, requestPasswordReset } from "@/app/adminpanel/actions";

interface User {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
}

export default function UserManagementClient({ initialUsers, currentUserId }: { initialUsers: User[], currentUserId: string }) {
    const [users, setUsers] = useState(initialUsers);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    // Form state
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "ADMIN"
    });

    const resetForm = () => {
        setForm({ name: "", email: "", password: "", role: "ADMIN" });
        setEditingUser(null);
        setShowForm(false);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setForm({
            name: user.name || "",
            email: user.email || "",
            password: "", // Nigdy nie pokazujemy starego hasła
            role: user.role
        });
        setShowForm(true);
    };

    const handleResetPassword = async (email: string) => {
        if (!confirm(`Czy na pewno wysłać link do resetowania hasła na adres ${email}?`)) return;
        setLoading(true);
        try {
            const res = await requestPasswordReset(email);
            if (res.success) alert("Link do resetowania hasła został wysłany!");
            else alert("Błąd: " + res.error);
        } catch (error) {
            console.error("Reset password error:", error);
            alert("Błąd połączenia z serwerem.");
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editingUser) {
                // Update
                const updateData: any = { name: form.name, email: form.email, role: form.role };
                if (form.password) updateData.password = form.password;

                await updateUser(editingUser.id, updateData);
                window.location.reload();
            } else {
                // Add
                await addUser({ name: form.name, email: form.email, role: form.role });
                alert("Konto zostało utworzone. Hasło tymczasowe zostało wysłane na e-mail użytkownika.");
                window.location.reload();
            }
            resetForm();
        } catch (error) {
            alert("Wystąpił błąd podczas zapisywania.");
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, email: string) => {
        if (id === currentUserId) {
            alert("Nie możesz usunąć samego siebie!");
            return;
        }
        if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${email}?`)) return;

        setLoading(true);
        try {
            await deleteUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert("Błąd podczas usuwania.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#061125] p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Back Link */}
                <div className="mb-6">
                    <Link href="/adminpanel" className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0A1C3B] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:text-brand-orange transition-all hover:shadow-md group">
                        <ArrowLeft className="w-5 h-5 text-brand-orange group-hover:-translate-x-1 transition-transform" />
                        Powrót do panelu
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-extrabold dark:text-white">Użytkownicy i Hasła</h1>
                        <p className="text-slate-500 text-sm">Zarządzaj osobami, które mają dostęp do edycji strony.</p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-brand-orange hover:bg-brand-orange-dark text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-brand-orange/20"
                        >
                            <UserPlus className="w-5 h-5" /> Dodaj Administratora
                        </button>
                    )}
                </div>

                {showForm && (
                    <div className="bg-white dark:bg-[#0A1C3B] p-6 sm:p-8 rounded-2xl border border-brand-orange/30 shadow-xl mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                                {editingUser ? <Key className="w-5 h-5 text-brand-orange" /> : <UserPlus className="w-5 h-5 text-brand-orange" />}
                                {editingUser ? "Edytuj dane / Zmień hasło" : "Dodaj nowego użytkownika"}
                            </h2>
                            <button onClick={resetForm} className="text-slate-400 hover:text-slate-700 dark:hover:text-white"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Imię / Nazwa</label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"
                                        placeholder="np. Michał Dygdoń"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adres Email (Login)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={e => setForm({ ...form, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none"
                                            placeholder="admin@elektryk.pl"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        {editingUser ? "Zmień Hasło Manualnie (opcjonalnie)" : "Hasło zostanie wygenerowane automatycznie"}
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            disabled={!editingUser}
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className={`w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none ${!editingUser ? "opacity-50 cursor-not-allowed italic" : ""}`}
                                            placeholder={editingUser ? "Nowe hasło" : "Hasło zostanie wysłane na email"}
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Rola</label>
                                    <select
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061125] dark:text-white focus:ring-2 focus:ring-brand-orange outline-none appearance-none"
                                    >
                                        <option value="ADMIN">Administrator</option>
                                        <option value="USER">Użytkownik (tylko CRM)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-orange/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    {loading ? "Przetwarzanie..." : editingUser ? "Zapisz zmiany" : "Stwórz konto"}
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Anuluj
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="bg-white dark:bg-[#0A1C3B] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                        <h3 className="font-bold dark:text-white">Aktywne konta administratorów</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.map(user => (
                            <div key={user.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-navy dark:bg-slate-800 flex items-center justify-center border-2 border-brand-orange/20">
                                        <UserIcon className="w-6 h-6 text-brand-orange" />
                                    </div>
                                    <div>
                                        <div className="font-bold dark:text-white flex items-center gap-2">
                                            {user.name || "Bez nazwy"}
                                            {user.id === currentUserId && <span className="bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Ty</span>}
                                            {user.role === "ADMIN" && <ShieldCheck className="w-4 h-4 text-brand-orange" />}
                                        </div>
                                        <div className="text-sm text-slate-500">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleResetPassword(user.email || "")}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-bold hover:text-brand-orange transition-colors flex items-center justify-center gap-2"
                                        title="Wyślij link do resetu hasła"
                                    >
                                        <Mail className="w-4 h-4" /> Resetuj
                                    </button>
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="flex-1 sm:flex-none px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Key className="w-4 h-4" /> Edytuj
                                    </button>
                                    {user.id !== currentUserId && (
                                        <button
                                            onClick={() => handleDelete(user.id, user.email || "")}
                                            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                            title="Usuń użytkownika"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
