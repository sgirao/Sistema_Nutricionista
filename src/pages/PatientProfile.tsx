import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { 
  ArrowLeft, 
  User, 
  Stethoscope, 
  Activity, 
  Save,
  Plus,
  Calendar,
  ChevronRight,
  Loader2,
  CheckCircle2,
  LayoutDashboard,
  Users,
  LogOut,
  TrendingUp,
  X,
  FileText,
  Clock,
  Droplets,
  Scale,
  Sparkles
} from 'lucide-react';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import '../styles/Dashboard.css';
import '../styles/Patients.css';
import '../styles/Profile.css';
import MealPlanModal from '../components/MealPlanModal';


type Tab = 'pessoal' | 'clinico' | 'habitos';

interface Patient {
  id: string;
  nome: string;
  data_nascimento: string;
  sexo: string;
  telefone: string;
  whatsapp: string;
  email: string;
  peso_inicial: number;
  altura: number;
  objetivos: string[];
  objetivo_texto: string;
  nivel_atividade: string;
  patologias: string[];
  restricoes_alimentares: string[];
  alergias: string[];
  medicamentos: string;
  suplementos: string;
  refeicoes_por_dia: number;
  horario_acorda: string;
  horario_dorme: string;
  litros_agua: number;
  atividade_fisica: boolean;
  atividade_fisica_descricao: string;
  observacoes: string;
}

interface Consultation {
  id: string;
  data_consulta: string;
  peso: number;
  cintura: number;
  quadril: number;
  percentual_gordura: number;
  observacoes: string;
  proximo_retorno: string;
}

interface MealPlan {
  id: string;
  created_at: string;
  conteudo: any;
}

const PatientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('pessoal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);


  // New Consultation Form State
  const [newConsult, setNewConsult] = useState({
    data_consulta: new Date().toISOString().split('T')[0],
    peso: '',
    cintura: '',
    quadril: '',
    percentual_gordura: '',
    observacoes: '',
    proximo_retorno: ''
  });

  useEffect(() => {
    if (id && user) {
      fetchPatientData();
    }
  }, [id, user]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch Patient
      const { data: patientData, error: patientError } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .eq('nutricionista_id', user?.id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch Consultations
      const { data: consultData, error: consultError } = await supabase
        .from('consultas')
        .select('*')
        .eq('paciente_id', id)
        .order('data_consulta', { ascending: false });

      if (consultError) throw consultError;
      setConsultations(consultData || []);

      // Fetch Meal Plans
      const { data: planData, error: planError } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('paciente_id', id)
        .order('created_at', { ascending: false });

      if (planError) throw planError;
      setMealPlans(planData || []);

    } catch (error) {
      console.error('Error fetching patient profile:', error);
      navigate('/pacientes');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (!patient) return;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setPatient({ ...patient, [name]: checked });
    } else {
      setPatient({ ...patient, [name]: value });
    }
  };

  const handleMultiSelect = (field: 'objetivos' | 'patologias' | 'restricoes_alimentares' | 'alergias', value: string) => {
    if (!patient) return;
    const current = patient[field] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setPatient({ ...patient, [field]: updated });
  };

  const savePatientChanges = async () => {
    if (!patient) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('pacientes')
        .update({
          ...patient,
          peso_inicial: parseFloat(patient.peso_inicial as any) || null,
          altura: parseFloat(patient.altura as any) || null,
          refeicoes_por_dia: parseInt(patient.refeicoes_por_dia as any) || null,
          litros_agua: parseFloat(patient.litros_agua as any) || null
        })
        .eq('id', patient.id);

      if (error) throw error;
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving patient changes:', error);
      alert('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  const handleConsultChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewConsult({ ...newConsult, [e.target.name]: e.target.value });
  };

  const saveNewConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('consultas')
        .insert([{
          paciente_id: id,
          data_consulta: newConsult.data_consulta,
          peso: parseFloat(newConsult.peso) || null,
          cintura: parseFloat(newConsult.cintura) || null,
          quadril: parseFloat(newConsult.quadril) || null,
          percentual_gordura: parseFloat(newConsult.percentual_gordura) || null,
          observacoes: newConsult.observacoes,
          proximo_retorno: newConsult.proximo_retorno || null
        }]);

      if (error) throw error;
      
      setShowConsultModal(false);
      setNewConsult({
        data_consulta: new Date().toISOString().split('T')[0],
        peso: '',
        cintura: '',
        quadril: '',
        percentual_gordura: '',
        observacoes: '',
        proximo_retorno: ''
      });
      fetchPatientData();
    } catch (error) {
      console.error('Error saving consultation:', error);
      alert('Erro ao salvar consulta.');
    } finally {
      setSaving(false);
    }
  };

  // Chart Data Preparation
  const chartData = [...consultations]
    .sort((a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime())
    .map(c => ({
      name: new Date(c.data_consulta).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      peso: c.peso
    }));

  // Add initial weight if no consultations or to show starting point
  if (patient && chartData.length > 0) {
    // Optional: show initial weight as the first point
  }

  if (loading) {
    return (
      <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Loader2 className="animate-spin text-green-500" size={48} />
        <span style={{ marginLeft: '12px', fontWeight: '500' }}>Carregando perfil do paciente...</span>
      </div>
    );
  }

  if (!patient) return null;

  const imc = (patient.peso_inicial > 0 && patient.altura > 0)
    ? (patient.peso_inicial / ((patient.altura / 100) * (patient.altura / 100))).toFixed(2)
    : '0.00';

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
        <button type="button" onClick={() => signOut()} className="logout-button">
          <LogOut size={20} /> Sair
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <button type="button" onClick={() => navigate('/pacientes')} className="nav-item" style={{ marginBottom: '24px', paddingLeft: 0 }}>
          <ArrowLeft size={20} /> Voltar para listagem
        </button>

        <header className="dashboard-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--primary-color)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={32} />
              </div>
              <h1 style={{ margin: 0 }}>{patient.nome}</h1>
            </div>
            <p style={{ marginLeft: '72px' }}>Acompanhamento nutricional completo</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              className="save-btn" 
              style={{ padding: '12px 24px', backgroundColor: '#9333ea' }}
              onClick={() => setShowMealPlanModal(true)}
            >
              <Sparkles size={18} /> Gerar Plano Alimentar
            </button>
          </div>

        </header>

        <div className="profile-container">
          
          {/* Seção 1: Dados do Paciente */}
          <section className="profile-section glass-card">
            <div className="profile-section-header">
              <div className="profile-section-title"><User size={24} /> Dados do Paciente</div>
              <button 
                type="button" 
                className="save-btn" 
                onClick={savePatientChanges}
                disabled={saving}
                style={{ backgroundColor: saveSuccess ? '#059669' : '' }}
              >
                {saving ? 'Salvando...' : saveSuccess ? <><CheckCircle2 size={18} /> Salvo!</> : <><Save size={18} /> Salvar Alterações</>}
              </button>
            </div>
            
            <div className="tabs-header">
              <button 
                type="button"
                className={`tab-btn ${activeTab === 'pessoal' ? 'active' : ''}`}
                onClick={() => setActiveTab('pessoal')}
              >
                1. Pessoal
              </button>
              <button 
                type="button"
                className={`tab-btn ${activeTab === 'clinico' ? 'active' : ''}`}
                onClick={() => setActiveTab('clinico')}
              >
                2. Clínico
              </button>
              <button 
                type="button"
                className={`tab-btn ${activeTab === 'habitos' ? 'active' : ''}`}
                onClick={() => setActiveTab('habitos')}
              >
                3. Hábitos
              </button>
            </div>

            <div className="profile-section-content">
              {activeTab === 'pessoal' && (
                <div className="fade-in">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo</label>
                      <input name="nome" value={patient.nome} onChange={handlePatientChange} />
                    </div>
                    <div className="form-group">
                      <label>Data de Nascimento</label>
                      <input type="date" name="data_nascimento" value={patient.data_nascimento || ''} onChange={handlePatientChange} />
                    </div>
                    <div className="form-group">
                      <label>Sexo</label>
                      <select name="sexo" value={patient.sexo} onChange={handlePatientChange}>
                        <option>Feminino</option>
                        <option>Masculino</option>
                        <option>Outro</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>E-mail</label>
                      <input type="email" name="email" value={patient.email || ''} onChange={handlePatientChange} />
                    </div>
                    <div className="form-group">
                      <label>Telefone</label>
                      <input name="telefone" value={patient.telefone || ''} onChange={handlePatientChange} />
                    </div>
                    <div className="form-group">
                      <label>WhatsApp</label>
                      <input name="whatsapp" value={patient.whatsapp || ''} onChange={handlePatientChange} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'clinico' && (
                <div className="fade-in">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Peso Inicial</label>
                      <div className="input-suffix">
                        <input type="number" step="0.1" name="peso_inicial" value={patient.peso_inicial || ''} onChange={handlePatientChange} />
                        <span className="suffix-text">kg</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Altura</label>
                      <div className="input-suffix">
                        <input type="number" name="altura" value={patient.altura || ''} onChange={handlePatientChange} />
                        <span className="suffix-text">cm</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>IMC Atual</label>
                      <input className="readonly-input" value={imc} readOnly />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Objetivos</label>
                    <div className="checkbox-group">
                      {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => (
                        <div 
                          key={obj}
                          className={`checkbox-item ${patient.objetivos?.includes(obj) ? 'active' : ''}`}
                          onClick={() => handleMultiSelect('objetivos', obj)}
                        >
                          {obj}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Patologias</label>
                    <div className="checkbox-group">
                      {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Doença celíaca', 'Colesterol alto'].map(p => (
                        <div 
                          key={p}
                          className={`checkbox-item ${patient.patologias?.includes(p) ? 'active' : ''}`}
                          onClick={() => handleMultiSelect('patologias', p)}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Medicamentos</label>
                      <textarea name="medicamentos" value={patient.medicamentos || ''} onChange={handlePatientChange} rows={3} />
                    </div>
                    <div className="form-group">
                      <label>Suplementos</label>
                      <textarea name="suplementos" value={patient.suplementos || ''} onChange={handlePatientChange} rows={3} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'habitos' && (
                <div className="fade-in">
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Refeições por dia</label>
                      <input type="number" name="refeicoes_por_dia" value={patient.refeicoes_por_dia || ''} onChange={handlePatientChange} />
                    </div>
                    <div className="form-group">
                      <label>Horário que acorda</label>
                      <input name="horario_acorda" value={patient.horario_acorda || ''} onChange={handlePatientChange} />
                    </div>
                    <div className="form-group">
                      <label>Horário que dorme</label>
                      <input name="horario_dorme" value={patient.horario_dorme || ''} onChange={handlePatientChange} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Água por dia (L)</label>
                      <input type="number" step="0.1" name="litros_agua" value={patient.litros_agua || ''} onChange={handlePatientChange} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Atividade Física</label>
                      <textarea name="atividade_fisica_descricao" value={patient.atividade_fisica_descricao || ''} onChange={handlePatientChange} rows={2} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Seção 2: Consultas */}
          <section className="profile-section glass-card">
            <div className="profile-section-header">
              <div className="profile-section-title"><Stethoscope size={24} /> Consultas e Evolução</div>
              <button type="button" className="save-btn" onClick={() => setShowConsultModal(true)}>
                <Plus size={18} /> Nova Consulta
              </button>
            </div>

            <div className="profile-section-content">
              <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} className="text-green-600" /> Evolução de Peso
              </h3>
              
              <div className="chart-container">
                {consultations.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12 }} 
                        dx={-10}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: 'none', 
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                          padding: '12px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="var(--primary-color)" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: 'var(--primary-color)', strokeWidth: 2, stroke: 'white' }} 
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Scale size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <p>Nenhuma consulta registrada ainda</p>
                  </div>
                )}
              </div>

              <h3 style={{ marginBottom: '20px' }}>Histórico de Consultas</h3>
              <div className="consultations-list">
                {consultations.length > 0 ? (
                  consultations.map(consult => (
                    <div key={consult.id} className="consultation-card">
                      <div className="consultation-header">
                        <div className="consultation-date">
                          <Calendar size={18} className="text-green-600" />
                          {new Date(consult.data_consulta).toLocaleDateString('pt-BR')}
                        </div>
                        {consult.proximo_retorno && (
                          <div className="next-return">
                            <Clock size={16} /> Próximo retorno: {new Date(consult.proximo_retorno).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                      
                      <div className="consultation-stats">
                        <div className="stat-item">
                          <span className="stat-label">Peso</span>
                          <span className="stat-value">{consult.peso} kg</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Cintura</span>
                          <span className="stat-value">{consult.cintura || '-'} cm</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Quadril</span>
                          <span className="stat-value">{consult.quadril || '-'} cm</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">% Gordura</span>
                          <span className="stat-value">{consult.percentual_gordura || '-'}%</span>
                        </div>
                      </div>

                      {consult.observacoes && (
                        <div className="consultation-notes">
                          <strong>Observações:</strong> {consult.observacoes}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    Nenhum registro de consulta encontrado.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Seção 3: Planos Alimentares */}
          <section className="profile-section glass-card">
            <div className="profile-section-header">
              <div className="profile-section-title"><Activity size={24} /> Planos Alimentares</div>
            </div>
            <div className="profile-section-content">
              <div className="meal-plans-list">
                {mealPlans.length > 0 ? (
                  mealPlans.map(plan => (
                    <div key={plan.id} className="meal-plan-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div className="meal-plan-icon"><FileText size={24} /></div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>Plano Alimentar</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Gerado em {new Date(plan.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <button type="button" className="nav-item" style={{ padding: 0, justifyContent: 'flex-start', color: 'var(--primary-color)' }}>
                        Ver completo <ChevronRight size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <Droplets size={48} style={{ marginBottom: '16px', opacity: 0.1, margin: '0 auto' }} />
                    <p>Nenhum plano alimentar gerado ainda</p>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Nova Consulta Modal */}
      {showConsultModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-header">
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Plus className="text-green-600" /> Nova Consulta
              </h2>
              <button type="button" onClick={() => setShowConsultModal(false)} className="nav-item" style={{ padding: 8 }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={saveNewConsultation}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Data da Consulta *</label>
                    <input type="date" name="data_consulta" value={newConsult.data_consulta} onChange={handleConsultChange} required />
                  </div>
                  <div className="form-group">
                    <label>Peso (kg) *</label>
                    <input type="number" step="0.1" name="peso" value={newConsult.peso} onChange={handleConsultChange} required placeholder="0.0" />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Cintura (cm)</label>
                    <input type="number" step="0.1" name="cintura" value={newConsult.cintura} onChange={handleConsultChange} placeholder="Opcional" />
                  </div>
                  <div className="form-group">
                    <label>Quadril (cm)</label>
                    <input type="number" step="0.1" name="quadril" value={newConsult.quadril} onChange={handleConsultChange} placeholder="Opcional" />
                  </div>
                  <div className="form-group">
                    <label>% Gordura</label>
                    <input type="number" step="0.1" name="percentual_gordura" value={newConsult.percentual_gordura} onChange={handleConsultChange} placeholder="Opcional" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Próximo Retorno</label>
                  <input type="date" name="proximo_retorno" value={newConsult.proximo_retorno} onChange={handleConsultChange} />
                </div>

                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>Observações</label>
                  <textarea name="observacoes" value={newConsult.observacoes} onChange={handleConsultChange} rows={4} placeholder="Evolução, dificuldades, novas metas..." />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowConsultModal(false)}>Cancelar</button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Consulta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Plano Alimentar com IA */}
      <MealPlanModal 
        isOpen={showMealPlanModal}
        onClose={() => setShowMealPlanModal(false)}
        patientId={id || ''}
        patientData={patient}
        onSaveSuccess={fetchPatientData}
      />
    </div>
  );
};


export default PatientProfile;
