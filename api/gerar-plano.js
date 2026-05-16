const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // Configurar CORS para desenvolvimento local
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { dados_do_paciente } = req.body;

    if (!dados_do_paciente) {
      return res.status(400).json({ error: 'Dados do paciente não fornecidos' });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GOOGLE_API_KEY não configurada no servidor' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    const response = await result.response;
    const text = response.text();
    
    // Limpar markdown se necessário
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const jsonResponse = JSON.parse(cleanJson);

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Erro no Gemini:', error);
    return res.status(500).json({ error: 'Erro ao processar plano alimentar: ' + error.message });
  }
};
