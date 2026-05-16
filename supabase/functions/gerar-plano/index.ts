// @ts-ignore: Deno imports are not resolved by the local IDE but work in Supabase
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from "https://esm.sh/@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { dados_do_paciente } = body;

    // Tentando ler a chave de múltiplas fontes para garantir sincronia
    const apiKey = Deno.env.get("GEMINI_FINAL_KEY") || Deno.env.get("GOOGLE_API_KEY") || Deno.env.get("GEMINI_API_KEY");
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key não encontrada. Certifique-se de criar 'GEMINI_FINAL_KEY' no Dashboard do Supabase." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!dados_do_paciente) {
      return new Response(JSON.stringify({ error: "Dados do paciente ausentes." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            plano_semanal: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  dia: { type: SchemaType.STRING },
                  refeicoes: {
                    type: SchemaType.OBJECT,
                    properties: {
                      cafe_da_manha: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                      lanche_manha: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                      almoco: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                      lanche_tarde: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                      jantar: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const prompt = `Você é um nutricionista profissional. Gere um plano alimentar semanal (7 dias, 5 opções por refeição) para o paciente: ${JSON.stringify(dados_do_paciente)}. Use alimentos comuns no Brasil.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return new Response(text, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("ERRO:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
