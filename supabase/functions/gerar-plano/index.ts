import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from "google-generative-ai";


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

    const apiKey = Deno.env.get("GOOGLE_API_KEY");
    console.log("Verificando chave no servidor...", !!apiKey);
    
    if (!apiKey) {

      return new Response(JSON.stringify({ error: "API Key não encontrada no servidor." }), {
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
      model: "gemini-pro",



      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const prompt = `Gere um plano alimentar semanal em formato JSON para o paciente: ${JSON.stringify(dados_do_paciente)}. Use alimentos comuns no Brasil.`;


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
