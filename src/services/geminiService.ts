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
   * @param dadosPaciente Objeto contendo as informações do paciente
   */
  async gerarPlanoAlimentar(dadosPaciente: any): Promise<PlanoAlimentarResponse> {
    const { data, error } = await supabase.functions.invoke('gerar-plano', {
      body: { dados_do_paciente: dadosPaciente },
    });

    if (error) {
      console.error('Erro retornado pelo Supabase:', error);
      
      let errorMessage = 'Erro na geração do plano.';
      
      // Tentar capturar a mensagem real enviada pelo nosso 'throw new Error' no backend
      try {
        if (error.context && typeof error.context.json === 'function') {
          const errorBody = await error.context.json();
          errorMessage = errorBody.error || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
      } catch (e) {
        errorMessage = error.message || errorMessage;
      }
      
      throw new Error(`${errorMessage}. Verifique a configuração no Supabase.`);
    }


    return data as PlanoAlimentarResponse;
  },
};



