import React from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Users, Briefcase, Calculator, Settings as SettingsIcon, Calendar as CalendarIcon, Wrench, BookOpen, Package, FileBarChart, Zap, MapPin, FileSignature, CircleDollarSign, ArrowLeft } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SalesList from './pages/SalesList';
import InvoiceGenerator from './pages/InvoiceGenerator';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Expenses from './pages/Expenses';
import CalendarPage from './pages/CalendarPage';
import Settings from './pages/Settings';
import Equipment from './pages/Equipment';
import KnowledgeBase from './pages/KnowledgeBase';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';

import Mileage from './pages/Mileage';
import ProtocolGenerator from './pages/ProtocolGenerator';
import Quotes from './pages/Quotes';
import Calculators from './pages/Calculators';
import ConstructionLog from './pages/ConstructionLog';
import CircuitBuilder from './pages/CircuitBuilder';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div style={{ padding: '0 16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'var(--primary-color)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>
            N
          </div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 0, fontWeight: 700, letterSpacing: '-0.5px', color: '#f3f4f6' }}>NiRejestrowana</h2>
        </div>

        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} />
          <span>Panel Główny</span>
        </NavLink>
        <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Klienci</span>
        </NavLink>
        <NavLink to="/sales" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ReceiptText size={20} />
          <span>Ewidencja</span>
        </NavLink>
        <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calculator size={20} />
          <span>Koszty</span>
        </NavLink>
        <NavLink to="/services" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Briefcase size={20} />
          <span>Usługi (Cennik)</span>
        </NavLink>
        <NavLink to="/quotes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CircleDollarSign size={20} />
          <span>Oferty i Wyceny</span>
        </NavLink>

        <NavLink to="/protocols" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileSignature size={20} />
          <span>Protokoły (Pomiary)</span>
        </NavLink>
        <NavLink to="/construction-log" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Dziennik Budowy</span>
        </NavLink>
        <NavLink to="/circuit-builder" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={20} />
          <span>Opisy Rozdzielnic</span>
        </NavLink>

        <div style={{ margin: '8px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>

        <NavLink to="/calendar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CalendarIcon size={20} />
          <span>Kalendarz</span>
        </NavLink>
        <NavLink to="/mileage" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MapPin size={20} />
          <span>Kilometrówka</span>
        </NavLink>
        <NavLink to="/equipment" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wrench size={20} />
          <span>Mój Sprzęt</span>
        </NavLink>
        <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={20} />
          <span>Magazyn Materiałów</span>
        </NavLink>
        <NavLink to="/knowledge" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Baza Wiedzy</span>
        </NavLink>
        <NavLink to="/calculators" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Zap size={20} />
          <span>Kalkulatory</span>
        </NavLink>
        <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
        <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileBarChart size={20} />
          <span>Generator Raportów</span>
        </NavLink>
        <div style={{ flex: 1 }}></div>

        <a href="/adminpanel" className="nav-item" style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          <ArrowLeft size={20} style={{ color: '#f59e0b' }} />
          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Powrót do Admina</span>
        </a>

        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <SettingsIcon size={20} />
          <span>Ustawienia</span>
        </NavLink>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<SalesList />} />
          <Route path="/invoice" element={<InvoiceGenerator />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/services" element={<Services />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/equipment" element={<Equipment />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/reports" element={<Reports />} />

          <Route path="/mileage" element={<Mileage />} />
          <Route path="/protocols" element={<ProtocolGenerator />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/calculators" element={<Calculators />} />
          <Route path="/construction-log" element={<ConstructionLog />} />
          <Route path="/circuit-builder" element={<CircuitBuilder />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
