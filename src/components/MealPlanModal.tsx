import React, { useState } from 'react';
import { X, Loader2, Sparkles, Save, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { geminiService, PlanoAlimentarResponse } from '../services/geminiService';
import { supabase } from '../lib/supabaseClient';

interface MealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientData: any;
  onSaveSuccess: () => void;
}

const MealPlanModal: React.FC<MealPlanModalProps> = ({ isOpen, onClose, patientId, patientData, onSaveSuccess }) => {
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<PlanoAlimentarResponse | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(0);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const plan = await geminiService.gerarPlanoAlimentar(patientData);
      setGeneratedPlan(plan);
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar plano alimentar.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedPlan) return;
    setSaving(true);
    try {
      const { error: saveError } = await supabase
        .from('planos_alimentares')
        .insert([{
          paciente_id: patientId,
          conteudo: generatedPlan
        }]);

      if (saveError) throw saveError;
      
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onSaveSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      alert('Erro ao salvar plano: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditMeal = (dayIndex: number, mealType: string, optionIndex: number, value: string) => {
    if (!generatedPlan) return;
    const newPlan = { ...generatedPlan };
    (newPlan.plano_semanal[dayIndex].refeicoes as any)[mealType][optionIndex] = value;
    setGeneratedPlan(newPlan);
  };

  const toggleDay = (index: number) => {
    setExpandedDay(expandedDay === index ? null : index);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in" style={{ maxWidth: '900px', width: '95%' }}>
        <div className="modal-header">
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles className="text-purple-600" /> Plano Alimentar com IA
          </h2>
          <button type="button" onClick={onClose} className="nav-item" style={{ padding: 8 }}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {!generatedPlan && !generating && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#f3e8ff', color: '#9333ea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Sparkles size={40} />
              </div>
              <h3>Gerar Plano Personalizado</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                A IA analisará os objetivos, restrições e hábitos do paciente para criar um plano semanal completo.
              </p>
              <button type="button" className="save-btn" onClick={handleGenerate} style={{ backgroundColor: '#9333ea', margin: '0 auto' }}>
                Começar Geração
              </button>
            </div>
          )}

          {generating && (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <Loader2 className="animate-spin text-purple-600" size={48} style={{ margin: '0 auto 20px' }} />
              <h3>NutriAI está criando o plano...</h3>
              <p>Isso pode levar alguns segundos.</p>
            </div>
          )}

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'center' }}>
              {error}
              <button onClick={handleGenerate} style={{ display: 'block', margin: '10px auto 0', textDecoration: 'underline', color: '#b91c1c', border: 'none', background: 'none', cursor: 'pointer' }}>
                Tentar novamente
              </button>
            </div>
          )}

          {generatedPlan && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p>Plano gerado com sucesso! Você pode editar cada opção abaixo antes de salvar.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {generatedPlan.plano_semanal.map((dia, dIdx) => (
                  <div key={dIdx} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div 
                      onClick={() => toggleDay(dIdx)}
                      style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: expandedDay === dIdx ? '#f8fafc' : 'transparent' }}
                    >
                      <h4 style={{ margin: 0 }}>{dia.dia}</h4>
                      {expandedDay === dIdx ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                    
                    {expandedDay === dIdx && (
                      <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0' }}>
                        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                          {Object.entries(dia.refeicoes).map(([mealType, options]) => (
                            <div key={mealType} className="form-group">
                              <label style={{ textTransform: 'capitalize' }}>
                                {mealType.replace(/_/g, ' ')}
                              </label>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {options.map((opt, oIdx) => (
                                  <input 
                                    key={oIdx}
                                    value={opt}
                                    onChange={(e) => handleEditMeal(dIdx, mealType, oIdx, e.target.value)}
                                    placeholder={`Opção ${oIdx + 1}`}
                                    style={{ fontSize: '0.9rem' }}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
          {generatedPlan && (
            <button 
              type="button" 
              className="save-btn" 
              onClick={handleSave} 
              disabled={saving}
              style={{ backgroundColor: saveSuccess ? '#059669' : '#9333ea' }}
            >
              {saving ? 'Salvando...' : saveSuccess ? <><CheckCircle2 size={18} /> Salvo!</> : <><Save size={18} /> Salvar Plano</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealPlanModal;
