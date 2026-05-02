import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { 
  Plus, 
  Search, 
  User, 
  Target, 
  Calendar,
  Loader2,
  LayoutDashboard,
  Users,
  LogOut
} from 'lucide-react';
import '../styles/Dashboard.css';
import '../styles/Patients.css';

interface Patient {
  id: string;
  nome: string;
  objetivo_texto: string;
  consultas: { data_consulta: string }[];
}

const PatientList: React.FC = () => {
  const { user, signOut } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          id, 
          nome, 
          objetivo_texto,
          consultas (data_consulta)
        `)
        .eq('nutricionista_id', user?.id)
        .order('nome');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const getLastConsultation = (consults: { data_consulta: string }[]) => {
    if (!consults || consults.length === 0) return 'Nenhuma';
    const sorted = [...consults].sort((a, b) => 
      new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
    );
    return new Date(sorted[0].data_consulta).toLocaleDateString('pt-BR');
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">NutriPlus</div>
        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="/pacientes" className="nav-item active">
            <Users size={20} /> Pacientes
          </a>
        </nav>
        <button onClick={() => signOut()} className="logout-button">
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="patients-header">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>Meus Pacientes</h1>
            <p className="patient-info">Gerencie sua base de pacientes e acompanhe o progresso.</p>
          </div>
          <a href="/pacientes/novo" className="new-patient-btn">
            <Plus size={20} /> Novo Paciente
          </a>
        </div>

        <div className="search-bar glass-card" style={{ marginBottom: '32px' }}>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Buscar paciente por nome..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin text-green-500" size={40} />
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="patients-table-container">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Objetivo Principal</th>
                  <th>Última Consulta</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr 
                    key={patient.id} 
                    className="patient-row"
                    onClick={() => navigate(`/paciente/${patient.id}`)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                          <User size={20} />
                        </div>
                        <span className="patient-name">{patient.nome}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <Target size={16} />
                        {patient.objetivo_texto || 'Não informado'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <Calendar size={16} />
                        {getLastConsultation(patient.consultas)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🥗</div>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>
              {search ? 'Nenhum paciente encontrado.' : 'Nenhum paciente cadastrado ainda.'}
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              {search ? 'Tente buscar com outro nome.' : 'Comece cadastrando seu primeiro paciente clicando no botão acima.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientList;
