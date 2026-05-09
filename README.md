# 🥗 NutriPlus - Sistema de Gestão para Nutricionistas

NutriPlus é uma plataforma moderna e intuitiva desenvolvida para auxiliar nutricionistas no gerenciamento de seus pacientes, consultas e evolução clínica. O sistema oferece uma experiência premium com design focado em usabilidade e performance.

![NutriPlus Preview](https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=1200&auto=format&fit=crop)

## 🚀 Funcionalidades Principais

- **🔐 Autenticação Segura**: Sistema de login e cadastro integrado ao Supabase Auth.
- **📊 Dashboard Inteligente**: Resumo de pacientes ativos, consultas da semana e alertas de pacientes sem retorno.
- **👥 Gestão de Pacientes**: Cadastro completo dividido em etapas (Pessoal, Clínico e Hábitos).
- **📈 Evolução Clínica**: Gráficos dinâmicos de evolução de peso e histórico detalhado de medidas.
- **📅 Registro de Consultas**: Sistema de log de consultas com controle de peso, medidas antropométricas e agendamento de retorno.
- **🍎 Planos Alimentares**: Histórico de planos gerados para acompanhamento contínuo.

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as tecnologias mais modernas do ecossistema web:

- **React 19 + Vite**: Para uma interface rápida e reativa.
- **TypeScript**: Garantindo robustez e segurança no código.
- **Supabase**: Backend-as-a-Service para Banco de Dados PostgreSQL e Autenticação.
- **Recharts**: Para visualização de dados e gráficos de evolução.
- **Lucide React**: Biblioteca de ícones modernos.
- **Vanilla CSS + Glassmorphism**: Design personalizado com efeitos de transparência e estética premium.
- **React Router 7**: Gerenciamento de rotas e navegação SPA.

## 📈 Processo de Desenvolvimento

O desenvolvimento seguiu uma metodologia ágil e iterativa:

1.  **Fundação e Auth**: Configuração do ambiente com Vite e integração inicial com Supabase para garantir a segurança dos dados desde o primeiro dia.
2.  **Interface Base**: Criação do sistema de design (tokens de cores, tipografia e componentes glassmorphism).
3.  **Gestão de Pacientes**: Implementação do fluxo de cadastro em etapas, garantindo que o usuário não se sinta sobrecarregado por formulários longos.
4.  **Dashboard e Lógica**: Desenvolvimento da inteligência do dashboard para exibir métricas relevantes para o nutricionista.
5.  **Perfil e Evolução**: Implementação do perfil detalhado do paciente, focando na visualização gráfica da evolução clínica.
6.  **Otimização para Deploy**: Configuração de rotas e regras de rewrite para publicação contínua na Vercel.

## ⚙️ Como Executar Localmente

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/sistema-nutricionista.git
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Configure as variáveis de ambiente no arquivo `.env`:
    ```env
    VITE_SUPABASE_URL=sua_url_aqui
    VITE_SUPABASE_ANON_KEY=sua_chave_aqui
    ```
4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido com ❤️ para simplificar a vida dos nutricionistas.
