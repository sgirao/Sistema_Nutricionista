import { supabase } from '../lib/supabaseClient';

export interface PlanoAlimentarResponse {
  plano_semanal: {
    dia: string;
    refeicoes: {
      cafe_da_manha: string[];
      lanche_manha: string[];
      almoco: string[];
      lanche_tarde: string[];
      jantar: string[];
    };
  }[];
}

export const geminiService = {
  /**
   * Chama a Edge Function do Supabase para gerar um plano alimentar.
   * @param dadosPaciente Objeto contendo as informações do paciente (objetivos, restrições, etc.)
   */
  async gerarPlanoAlimentar(dadosPaciente: any): Promise<PlanoAlimentarResponse> {
    const { data, error } = await supabase.functions.invoke('gerar-plano', {
      body: { dados_do_paciente: dadosPaciente },
    });

    if (error) {
      console.error('Erro ao chamar Edge Function:', error);
      throw new Error('Falha ao gerar plano alimentar. Tente novamente mais tarde.');
    }

    return data as PlanoAlimentarResponse;
  },
};
