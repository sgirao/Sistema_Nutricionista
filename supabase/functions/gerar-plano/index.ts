import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { dados_do_paciente } = await req.json();

    if (!dados_do_paciente) {
      throw new Error("Dados do paciente não fornecidos.");
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não configurada no servidor.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Você é um nutricionista profissional.
      Gere um plano alimentar semanal com base nos dados abaixo.

      ⚠️ Regras:
      - Responda APENAS em JSON válido
      - Não use markdown
      - Não escreva explicações
      - Respeite restrições e alergias

      Dados do paciente:
      ${JSON.stringify(dados_do_paciente)}

      Formato obrigatório:
      {
        "plano_semanal": [
          {
            "dia": "Segunda-feira",
            "refeicoes": {
              "cafe_da_manha": ["", "", "", "", ""],
              "lanche_manha": ["", "", "", "", ""],
              "almoco": ["", "", "", "", ""],
              "lanche_tarde": ["", "", "", "", ""],
              "jantar": ["", "", "", "", ""]
            }
          }
        ]
      }

      Regras Adicionais:
      - gerar 7 dias
      - 5 opções por refeição
      - evitar repetição
      - usar alimentos comuns no Brasil
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Limpar markdown se a IA ignorar a regra
    const cleanJson = responseText.replace(/```json|```/g, "").trim();
    const jsonResponse = JSON.parse(cleanJson);

    return new Response(JSON.stringify(jsonResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
