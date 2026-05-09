import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { 
  ArrowLeft, 
  User, 
  Stethoscope, 
  Activity, 
  Save,
  ChevronRight,
  Info,
  Clock,
  Droplets,
  CheckCircle2,
  LayoutDashboard,
  Users,
  LogOut
} from 'lucide-react';
import '../styles/Dashboard.css';
import '../styles/Patients.css';

type Tab = 'pessoal' | 'clinico' | 'habitos';

const PatientForm: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('pessoal');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    data_nascimento: '',
    sexo: 'Feminino',
    telefone: '',
    whatsapp: '',
    email: '',
    peso_inicial: '',
    altura: '',
    objetivos: [] as string[],
    objetivo_texto: '',
    nivel_atividade: 'Sedentário',
    patologias: [] as string[],
    restricoes_alimentares: [] as string[],
    alergias: [] as string[],
    medicamentos: '',
    suplementos: '',
    refeicoes_por_dia: '',
    horario_acorda: '',
    horario_dorme: '',
    litros_agua: '',
    atividade_fisica: false,
    atividade_fisica_descricao: '',
    observacoes: ''
  });

  const [imc, setImc] = useState<string>('0.00');
  const [idade, setIdade] = useState<number | null>(null);

  // Auto-calculate Age
  useEffect(() => {
    if (formData.data_nascimento) {
      const birthDate = new Date(formData.data_nascimento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setIdade(age);
    }
  }, [formData.data_nascimento]);

  // Auto-calculate IMC
  useEffect(() => {
    const weight = parseFloat(formData.peso_inicial);
    const height = parseFloat(formData.altura) / 100;
    if (weight > 0 && height > 0) {
      const result = weight / (height * height);
      setImc(result.toFixed(2));
    } else {
      setImc('0.00');
    }
  }, [formData.peso_inicial, formData.altura]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelect = (field: 'objetivos' | 'patologias' | 'restricoes_alimentares' | 'alergias', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
  };

  const formatTime = (value: string) => {
    if (!value) return '';
    const clean = value.replace(/\D/g, '').slice(0, 4);
    if (clean.length <= 2) return clean.padStart(2, '0') + ':00';
    return clean.slice(0, 2).padStart(2, '0') + ':' + clean.slice(2).padStart(2, '0');
  };

  const handleTimeBlur = (field: 'horario_acorda' | 'horario_dorme') => {
    const formatted = formatTime(formData[field]);
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([{
          ...formData,
          nutricionista_id: user?.id,
          peso_inicial: parseFloat(formData.peso_inicial) || null,
          altura: parseFloat(formData.altura) || null,
          refeicoes_por_dia: parseInt(formData.refeicoes_por_dia) || null,
          litros_agua: parseFloat(formData.litros_agua) || null
        }])
        .select();

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate(`/paciente/${data[0].id}`);
      }, 2000);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Erro ao salvar paciente. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="dashboard-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', maxWidth: '500px' }}>
          <CheckCircle2 size={80} className="text-green-500" style={{ margin: '0 auto 24px' }} />
          <h1 style={{ marginBottom: '16px' }}>Paciente Cadastrado!</h1>
          <p style={{ color: 'var(--text-muted)' }}>Os dados foram salvos com sucesso. Redirecionando para o perfil...</p>
        </div>
      </div>
    );
  }

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

        <header className="dashboard-header">
          <h1>Novo Paciente</h1>
          <p>Preencha as informações para iniciar o acompanhamento.</p>
        </header>

        <div className="glass-card form-card">
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

          <form onSubmit={handleSave}>
            <div className="form-content">
              
              {/* Aba 1: Pessoal */}
              {activeTab === 'pessoal' && (
                <div className="fade-in">
                  <h2 className="form-section-title"><User size={24} /> Informações Pessoais</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nome Completo *</label>
                      <input 
                        name="nome" 
                        value={formData.nome} 
                        onChange={handleChange} 
                        required 
                        placeholder="Nome completo do paciente"
                      />
                    </div>
                    <div className="form-group">
                      <label>Data de Nascimento</label>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input 
                          type="date" 
                          name="data_nascimento" 
                          value={formData.data_nascimento} 
                          onChange={handleChange}
                        />
                        {idade !== null && (
                          <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '12px', fontWeight: '600' }}>
                            {idade} anos
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Sexo</label>
                      <select name="sexo" value={formData.sexo} onChange={handleChange}>
                        <option>Feminino</option>
                        <option>Masculino</option>
                        <option>Outro</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>E-mail</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="email@paciente.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Telefone</label>
                      <input 
                        name="telefone" 
                        value={formData.telefone} 
                        onChange={handleChange} 
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                    <div className="form-group">
                      <label>WhatsApp</label>
                      <input 
                        name="whatsapp" 
                        value={formData.whatsapp} 
                        onChange={handleChange} 
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Aba 2: Clínico */}
              {activeTab === 'clinico' && (
                <div className="fade-in">
                  <h2 className="form-section-title"><Stethoscope size={24} /> Dados Clínicos</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Peso Inicial</label>
                      <div className="input-suffix">
                        <input 
                          type="number" 
                          step="0.1" 
                          name="peso_inicial" 
                          value={formData.peso_inicial} 
                          onChange={handleChange}
                        />
                        <span className="suffix-text">kg</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Altura</label>
                      <div className="input-suffix">
                        <input 
                          type="number" 
                          name="altura" 
                          value={formData.altura} 
                          onChange={handleChange}
                        />
                        <span className="suffix-text">cm</span>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>IMC (Cálculo Automático)</label>
                      <input className="readonly-input" value={imc} readOnly />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Nível de Atividade Física</label>
                    <div className="checkbox-group">
                      {['Sedentário', 'Levemente ativo', 'Moderadamente ativo', 'Muito ativo', 'Extremamente ativo'].map(lvl => (
                        <div 
                          key={lvl}
                          className={`checkbox-item ${formData.nivel_atividade === lvl ? 'active' : ''}`}
                          onClick={() => setFormData(prev => ({ ...prev, nivel_atividade: lvl }))}
                        >
                          {lvl}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Objetivos</label>
                    <div className="checkbox-group">
                      {['Emagrecer', 'Ganhar massa', 'Controlar diabetes', 'Saúde geral', 'Performance esportiva', 'Reeducação alimentar'].map(obj => (
                        <div 
                          key={obj}
                          className={`checkbox-item ${formData.objetivos.includes(obj) ? 'active' : ''}`}
                          onClick={() => handleMultiSelect('objetivos', obj)}
                        >
                          {obj}
                        </div>
                      ))}
                    </div>
                    <input 
                      style={{ marginTop: '12px' }}
                      name="objetivo_texto" 
                      value={formData.objetivo_texto} 
                      onChange={handleChange} 
                      placeholder="Outro objetivo ou observação adicional..."
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label>Patologias / Condições</label>
                    <div className="checkbox-group">
                      {['Diabetes', 'Hipertensão', 'Hipotireoidismo', 'Hipertireoidismo', 'Síndrome do ovário policístico', 'Doença celíaca', 'Colesterol alto'].map(p => (
                        <div 
                          key={p}
                          className={`checkbox-item ${formData.patologias.includes(p) ? 'active' : ''}`}
                          onClick={() => handleMultiSelect('patologias', p)}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Medicamentos Contínuos</label>
                      <textarea 
                        name="medicamentos" 
                        value={formData.medicamentos} 
                        onChange={handleChange} 
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label>Suplementos em Uso</label>
                      <textarea 
                        name="suplementos" 
                        value={formData.suplementos} 
                        onChange={handleChange} 
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Aba 3: Hábitos */}
              {activeTab === 'habitos' && (
                <div className="fade-in">
                  <h2 className="form-section-title"><Activity size={24} /> Hábitos de Vida</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Refeições por dia</label>
                      <input 
                        type="number" 
                        name="refeicoes_por_dia" 
                        value={formData.refeicoes_por_dia} 
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Horário que acorda</label>
                      <div className="input-suffix">
                        <Clock className="input-icon" size={16} style={{ left: '15px' }} />
                        <input 
                          name="horario_acorda" 
                          value={formData.horario_acorda} 
                          onChange={handleChange}
                          onBlur={() => handleTimeBlur('horario_acorda')}
                          placeholder="Ex: 630"
                          style={{ paddingLeft: '40px' }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Horário que dorme</label>
                      <div className="input-suffix">
                        <Clock className="input-icon" size={16} style={{ left: '15px' }} />
                        <input 
                          name="horario_dorme" 
                          value={formData.horario_dorme} 
                          onChange={handleChange}
                          onBlur={() => handleTimeBlur('horario_dorme')}
                          placeholder="Ex: 2230"
                          style={{ paddingLeft: '40px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Água por dia</label>
                      <div className="input-suffix">
                        <Droplets className="input-icon" size={16} style={{ left: '15px' }} />
                        <input 
                          type="number" 
                          step="0.1" 
                          name="litros_agua" 
                          value={formData.litros_agua} 
                          onChange={handleChange}
                          style={{ paddingLeft: '40px' }}
                        />
                        <span className="suffix-text">litros</span>
                      </div>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Pratica atividade física?</label>
                      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            checked={formData.atividade_fisica} 
                            onChange={() => setFormData(prev => ({ ...prev, atividade_fisica: true }))} 
                            style={{ width: 'auto' }}
                          /> Sim
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input 
                            type="radio" 
                            checked={!formData.atividade_fisica} 
                            onChange={() => setFormData(prev => ({ ...prev, atividade_fisica: false }))} 
                            style={{ width: 'auto' }}
                          /> Não
                        </label>
                      </div>
                      {formData.atividade_fisica && (
                        <input 
                          style={{ marginTop: '16px' }}
                          name="atividade_fisica_descricao" 
                          value={formData.atividade_fisica_descricao} 
                          onChange={handleChange} 
                          placeholder="Qual atividade e frequência semanal?"
                        />
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Observações Gerais</label>
                    <textarea 
                      name="observacoes" 
                      value={formData.observacoes} 
                      onChange={handleChange} 
                      rows={4}
                      placeholder="Alguma informação adicional relevante..."
                    />
                  </div>
                </div>
              )}

            </div>

            <div className="form-footer">
              <button type="button" className="cancel-btn" onClick={() => navigate('/pacientes')}>Cancelar</button>
              {activeTab !== 'habitos' ? (
                <button 
                  type="button" 
                  className="save-btn" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(activeTab === 'pessoal' ? 'clinico' : 'habitos');
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Próxima etapa <ChevronRight size={18} />
                </button>
              ) : (
                <button type="submit" className="save-btn" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {loading ? 'Salvando...' : <><Save size={18} /> Salvar Paciente</>}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PatientForm;
