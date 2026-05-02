import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { 
  LogOut, 
  LayoutDashboard, 
  Users, 
  Calendar, 
  AlertTriangle,
  ChevronRight,
  Loader2
} from 'lucide-react';
import '../styles/Dashboard.css';

interface PatientNoReturn {
  id: string;
  nome: string;
  ultimaConsulta: string;
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [totalPatients, setTotalPatients] = useState(0);
  const [weeklyConsultations, setWeeklyConsultations] = useState(0);
  const [patientsNoReturn, setPatientsNoReturn] = useState<PatientNoReturn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Total Patients
      const { count: patientsCount, error: patientsError } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('nutricionista_id', user?.id);

      if (patientsError) throw patientsError;
      setTotalPatients(patientsCount || 0);

      // 2. Weekly Consultations
      const today = new Date();
      const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      
      const { count: consultsCount, error: consultsError } = await supabase
        .from('consultas')
        .select('*, pacientes!inner(nutricionista_id)', { count: 'exact', head: true })
        .eq('pacientes.nutricionista_id', user?.id)
        .gte('data_consulta', firstDayOfWeek.toISOString().split('T')[0])
        .lte('data_consulta', lastDayOfWeek.toISOString().split('T')[0]);

      if (consultsError) throw consultsError;
      setWeeklyConsultations(consultsCount || 0);

      // 3. Patients Without Return
      // Logic: Patients whose last consultation was > 30 days ago and have no upcoming return
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      // Fetch patients and their consultations
      const { data: patientsData, error: noReturnError } = await supabase
        .from('pacientes')
        .select(`
          id, 
          nome, 
          consultas (
            data_consulta, 
            proximo_retorno
          )
        `)
        .eq('nutricionista_id', user?.id);

      if (noReturnError) throw noReturnError;

      const overdue: PatientNoReturn[] = [];
      const todayStr = new Date().toISOString().split('T')[0];

      patientsData?.forEach(patient => {
        const consults = patient.consultas as any[];
        if (!consults || consults.length === 0) return;

        // Sort consultations by date descending
        const sortedConsults = [...consults].sort((a, b) => 
          new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime()
        );

        const latestConsult = sortedConsults[0];
        
        // Check if there's any FUTURE return scheduled in ANY consultation record
        const hasFutureReturn = consults.some(c => c.proximo_retorno && c.proximo_retorno >= todayStr);

        if (!hasFutureReturn && latestConsult.data_consulta < thirtyDaysAgoStr) {
          overdue.push({
            id: patient.id,
            nome: patient.nome,
            ultimaConsulta: new Date(latestConsult.data_consulta).toLocaleDateString('pt-BR')
          });
        }
      });

      setPatientsNoReturn(overdue);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin text-green-500" size={48} />
        <span style={{ marginLeft: '12px', fontWeight: '500' }}>Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">NutriPlus</div>
        
        <nav className="sidebar-nav">
          <a href="/dashboard" className="nav-item active">
            <LayoutDashboard size={20} /> Dashboard
          </a>
          <a href="/pacientes" className="nav-item">
            <Users size={20} /> Pacientes
          </a>
        </nav>

        <button onClick={() => signOut()} className="logout-button">
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Olá, Nutricionista!</h1>
          <p>Confira o resumo do seu dia e de seus pacientes.</p>
        </header>

        <div className="stats-grid">
          {/* Card 1: Total Patients */}
          <div className="stat-card glass-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Total de Pacientes</span>
              <div className="stat-card-icon">
                <Users size={24} />
              </div>
            </div>
            <div className="stat-card-value">{totalPatients}</div>
          </div>

          {/* Card 2: Weekly Consults */}
          <div className="stat-card glass-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Consultas da Semana</span>
              <div className="stat-card-icon">
                <Calendar size={24} />
              </div>
            </div>
            <div className="stat-card-value">{weeklyConsultations}</div>
          </div>

          {/* Card 3: No Return Alerts */}
          <div className="stat-card glass-card alert-card">
            <div className="stat-card-header">
              <span className="stat-card-label">Pacientes sem Retorno (+30 dias)</span>
              <div className="stat-card-icon" style={{ backgroundColor: '#fff7ed', color: '#f97316' }}>
                <AlertTriangle size={24} />
              </div>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              {patientsNoReturn.length > 0 ? (
                <ul className="no-return-list">
                  {patientsNoReturn.map(p => (
                    <li key={p.id}>
                      <a href={`/paciente/${p.id}`} className="no-return-item">
                        <div>
                          <div className="no-return-name">{p.nome}</div>
                          <div className="no-return-date">Última consulta: {p.ultimaConsulta}</div>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  Nenhum paciente sem retorno no momento.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
