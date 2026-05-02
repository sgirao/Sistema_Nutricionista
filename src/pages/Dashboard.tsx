import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Users, Calendar, ClipboardList } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Placeholder */}
      <aside style={{ width: '260px', background: 'white', borderRight: '1px solid #eee', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '40px', fontSize: '1.5rem', fontWeight: '800' }}>NutriPlus</h2>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#e8f5e9', color: 'var(--primary-color)', borderRadius: '12px', fontWeight: '600' }}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: 'var(--text-muted)' }}>
            <Users size={20} /> Pacientes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: 'var(--text-muted)' }}>
            <Calendar size={20} /> Consultas
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: 'var(--text-muted)' }}>
            <ClipboardList size={20} /> Planos
          </div>
        </nav>

        <button 
          onClick={() => signOut()}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#e74c3c', background: 'none', fontWeight: '600' }}
        >
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* Main Content Placeholder */}
      <main style={{ flex: 1, padding: '40px', background: '#f8fafc' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b' }}>Olá, Nutricionista!</h1>
          <p style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Total de Pacientes</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>0</p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Consultas Hoje</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>0</p>
          </div>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Planos Ativos</h3>
            <p style={{ fontSize: '2rem', fontWeight: '700' }}>0</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
