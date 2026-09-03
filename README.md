# Captação de Leads ABMIX

Sistema integrado e desacoplado para captação, validação, deduplicação e sincronização de leads. O projeto recebe submissões a partir de formulários web, processa os dados por meio de uma API própria em Node.js/Express hospedada em nuvem no Render, armazena os registros oficiais no Supabase com segurança (RLS) e sincroniza automaticamente as informações com o Google Sheets para consulta operacional e comercial.

## 1. Objetivo do Projeto

O objetivo principal é fornecer uma infraestrutura robusta, escalável e segura para captação de leads da ABMIX:
- **Desacoplamento total**: O frontend de captura não possui dependência direta do banco de dados ou chaves privilegiadas.
- **Integridade e higienização dos dados**: Validação rigorosa com Zod (comprimento, formato de e-mail, telefone, idade) e deduplicação inteligente (por e-mail ou telefone).
- **Visão operacional acessível**: Disponibilização dos leads em tempo real em uma planilha Google Sheets para times de atendimento e vendas, sem expor o banco de dados.
- **Prontidão para automações**: Arquitetura pronta para integração com webhooks de CRM, ferramentas de mensageria (WhatsApp/e-mail) ou n8n.

## 2. Arquitetura Atual e Fluxo de Dados

A arquitetura do projeto segue um fluxo unidirecional ponta a ponta:

```text
[ Visitante preenche formulário ]
                ↓
    Frontend (React / TanStack)
  (Abmix-tech-Programacao/formulario-teste)
                ↓  (POST HTTPS via JSON)
   Render Web Service (Nuvem)
  https://captacao-leads-mj5h.onrender.com/api/leads
                ↓
    API ABMIX (Express / TypeScript)
  (Validação Zod + Normalização + Deduplicação)
                ↓  (REST API autenticada - Server Side)
      Supabase PostgreSQL (public.leads)
  (Banco de dados oficial com RLS ativado)
                ↓  (Sincronização periódica via REST)
 Google Apps Script (sincronizarLeads + Trigger Temporal)
                ↓
   Google Sheets (Visão Operacional e Comercial)
  ("Captacao de Leads - Teste Integracao")
                ↓
 [ Futuro: n8n / Disparo WhatsApp / CRM ]
```

### Detalhamento do Fluxo:
1. **Frontend**: O usuário submete o formulário web.
2. **Render**: A requisição `POST` em HTTPS chega ao Web Service do Render (`https://captacao-leads-mj5h.onrender.com/api/leads`).
3. **API ABMIX**: Valida os campos via Zod, normaliza e-mail/telefone e grava no banco ou atualiza o cadastro existente.
4. **Supabase**: Armazena o lead na tabela `public.leads` protegida por RLS.
5. **Google Apps Script**: Um acionador temporal periódico aciona `sincronizarLeads()`.
6. **Google Sheets**: A planilha recebe o novo registro para acompanhamento do time comercial.

## 3. Estado Atual — 03/09/2026

### Checklist do que já foi concluído:
- [x] Backend desacoplado e standalone em `artifacts/api-server` (independente de workspaces locais).
- [x] Banco de dados Supabase configurado com tabela `public.leads` e políticas RLS ativas.
- [x] Backend publicado com sucesso em produção no **Render**.
- [x] URL pública HTTPS ativa e monitorada: `https://captacao-leads-mj5h.onrender.com`.
- [x] Endpoint de verificação `/api/healthz` testado em nuvem com resposta `ok`.
- [x] Endpoint de recebimento `/api/leads` testado em nuvem com sucesso.
- [x] Teste de API direta realizado: lead **"Teste API Publica ABMIX"** gravado e validado.
- [x] Frontend configurado para apontar para a URL pública do Render.
- [x] Teste integrado via interface realizado: lead **"Teste Render Frontend"** submetido pelo formulário.
- [x] Gravação do lead do frontend confirmada no Supabase.
- [x] Planilha Google Sheets configurada como visão comercial.
- [x] Função `sincronizarLeads` no Google Apps Script configurada e testada.
- [x] Acionador automático baseado em tempo configurado e sincronizando autonomamente.
- [x] Confirmação do registro do formulário refletido no Google Sheets.

### Pendências e Próximos Passos:
- [ ] **Permissão de escrita no GitHub**: Liberar permissão de escrita para a conta do desenvolvedor no repositório `Abmix-tech-Programacao/formulario-teste` para realização do `git push`.
- [ ] **Publicação pública do Frontend**: Realizar o deploy do frontend em serviço de hospedagem web (Vercel, Cloudflare Pages ou Netlify).
- [ ] **Restrição de CORS**: Definir a lista de domínios autorizados no backend assim que o domínio do frontend estiver publicado.
- [ ] **Proteção adicional**: Configurar rate limit e proteção anti-spam antes da divulgação pública ampla.

## 4. Tecnologias Utilizadas

| Camada | Tecnologia | Finalidade no Projeto |
| :--- | :--- | :--- |
| **Backend** | Node.js (v20+) / Express (v5) / TypeScript | Servidor da API, roteamento e middlewares |
| **Validação de Dados** | Zod | Validação rigorosa de esquemas, tipos e regras de negócio |
| **Logging Estruturado**| Pino & Pino-HTTP | Monitoramento de requisições sem logar dados sensíveis |
| **Hospedagem da API** | Render (Web Service) | Servidor em nuvem com provisionamento automático e HTTPS |
| **Banco de Dados** | Supabase (PostgreSQL) | Banco relacional oficial com políticas ativas de RLS |
| **Frontend** | React 19 / TanStack Router & Start / Tailwind CSS | Interface moderna do formulário de captação |
| **Planilha Operacional**| Google Sheets | Visão operacional/comercial para consulta dos leads |
| **Sincronização** | Google Apps Script | Sincronizador autônomo com acionador temporal periódico |
| **Futuras Automações** | n8n | Orquestração prevista para mensageria (WhatsApp) e CRM |

## 5. Repositórios do Ecossistema

O ecossistema é composto por dois repositórios independentes mantidos na organização da ABMIX no GitHub:

1. **Repositório Principal (Backend & Infraestrutura)**:
   - **Nome**: `Abmix-tech-Programacao/captacao-leads`
   - **Descrição**: Código do servidor Node.js/Express (`artifacts/api-server`), contratos de integração OpenAPI, documentação de pipelines e scripts de sincronização com o Google Sheets.
2. **Repositório do Frontend (Interface de Captação)**:
   - **Nome**: `Abmix-tech-Programacao/formulario-teste`
   - **Descrição**: Aplicação web em React 19 com formulário de captação, máscaras de campos, validação client-side e integração com a API pública.

## 6. Estrutura de Pastas do Projeto Principal

```text
captacao-leads/
├── artifacts/
│   └── api-server/                 # Código-fonte da API Express Standalone
│       ├── src/
│       │   ├── lib/                # Conexão Supabase, Logger e regras de leads
│       │   ├── middlewares/        # Middlewares de requisição
│       │   ├── routes/             # Rotas (/api/healthz e /api/leads)
│       │   ├── app.ts              # Configuração do Express, CORS e JSON limit
│       │   └── index.ts            # Ponto de entrada e escuta na porta HTTP
│       ├── package.json            # Dependências npm da API
│       ├── tsconfig.json           # Configuração do TypeScript
│       └── .env                    # Variáveis locais (protegido pelo .gitignore)
├── docs/
│   ├── api-contract.md             # Contrato de dados e documentação da API
│   ├── google-sheets-sync.gs       # Código-fonte de referência do Apps Script
│   └── n8n-workflow.md             # Desenho da arquitetura futura com n8n
├── formulario-teste/               # Clone local para desenvolvimento do frontend
│   └── src/routes/index.tsx        # Formulário integrado à API pública
├── lib/
│   └── api-spec/                   # Especificações OpenAPI / Swagger
└── README.md                       # Documentação central do projeto
```

## 7. Backend Node.js / Express

O backend opera de forma desacoplada no diretório `artifacts/api-server`, preparado tanto para execução local de desenvolvimento quanto para hospedagem em nuvem.

### Endpoints Disponíveis

#### 1. `GET /api/healthz`
Endpoint de health check para monitoramento de disponibilidade e reinício de serviços.
- **Resposta**:
  ```json
  { "status": "ok" }
  ```

#### 2. `POST /api/leads`
Endpoint que recebe o cadastro de um novo lead, valida os campos via Zod, verifica duplicidade por e-mail ou telefone e persiste no banco de dados.
- **Headers**: `Content-Type: application/json`
- **Campos do Payload**:
  - `name`: (obrigatório) Nome completo (2 a 120 caracteres).
  - `age`: (obrigatório) Idade como número inteiro (18 a 120 anos).
  - `email`: (obrigatório) E-mail válido e normalizado.
  - `phone`: (obrigatório) Telefone com DDD (8 a 40 caracteres, caracteres especiais removidos na comparação).
  - `city`: (obrigatório) Cidade (2 a 100 caracteres).
  - `consent`: (obrigatório) Deve ser explicitamente `true`.
  - `notes`: (opcional) Observações (até 1.000 caracteres).
  - `source`: (opcional) Origem do lead (ex: `"frontend-guilherme"`).

### Execução Local (Opcional para Desenvolvimento)
Para rodar a API localmente a partir da raiz:
```powershell
Set-Location .\artifacts\api-server
npm install
npm start
```
A API iniciará na porta `3000` (ou na definida pela variável de ambiente `PORT`).

## 8. Hospedagem no Render

O backend está publicado e operando em ambiente de produção no **Render**.

- **URL Pública Base**: `https://captacao-leads-mj5h.onrender.com`
- **Health Check Endpoint**: `https://captacao-leads-mj5h.onrender.com/api/healthz`
- **Leads Endpoint**: `https://captacao-leads-mj5h.onrender.com/api/leads`

### Configuração Utilizada no Render
- **Tipo de Serviço**: Web Service
- **Ambiente de Execução**: `Node`
- **Branch**: `main`
- **Root Directory**: `artifacts/api-server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Variáveis de Ambiente (Configuradas com segurança no painel do Render)**:
  - `LEAD_PIPELINE_MODE`: `direct`
  - `SUPABASE_URL`: URL oficial do projeto Supabase
  - `SUPABASE_SECRET_KEY`: Chave de serviço segura (*Server Secret Key*)
  - `PORT`: Porta atribuída automaticamente pelo Render

### Limitações do Plano Gratuito do Render
- **Suspensão por Inatividade (Sleep)**: Após **15 minutos** sem tráfego HTTP, o contêiner entra em modo de hibernação para economia de recursos.
- **Cold Start (Inicialização a frio)**: A primeira requisição recebida após o período de inatividade acorda a instância, o que leva aproximadamente **50 segundos** para responder. As requisições subsequentes respondem imediatamente.
- **Limite Mensal**: O plano gratuito disponibiliza até 750 horas de computação por mês.

## 9. Testes Realizados e Resultados Validados

Todos os fluxos foram testados e validados ponta a ponta:

### 1. Teste de Monitoramento de Saúde
Requisição executada contra a URL pública da API no Render:
```powershell
Invoke-RestMethod -Uri "https://captacao-leads-mj5h.onrender.com/api/healthz" -Method Get
```
- **Resultado obtido**:
  ```text
  status
  ------
  ok
  ```

### 2. Teste Direto: "Teste API Publica ABMIX"
Disparo direto via terminal para a API pública no Render contendo o lead *"Teste API Publica ABMIX"*:
```powershell
Invoke-RestMethod -Uri "https://captacao-leads-mj5h.onrender.com/api/leads" -Method Post -ContentType "application/json" -Body '{"name":"Teste API Publica ABMIX","age":35,"email":"teste.publica@abmix.tech","phone":"11988887777","city":"Sao Paulo","notes":"Validacao da API Publica no Render","source":"powershell-test","consent":true}'
```
- **Resultado obtido da API**:
  ```text
  success : True
  created : True
  message : Cadastro recebido.
  ```
- **Confirmação**: Registro gravado na tabela `public.leads` do Supabase e espelhado com sucesso para o Google Sheets.

### 3. Teste Integrado: "Teste Render Frontend"
Submissão realizada diretamente pelo formulário web na interface do usuário:
- **Dados enviados**:
  - Nome: `Teste Render Frontend`
  - Idade: `30`
  - Telefone: `11999998888`
  - E-mail: `teste.render.front@abmix.tech`
  - Cidade: `São Paulo - SP`
  - Observações: `Teste envio ponta a ponta frontend -> render -> supabase -> sheets`
  - Origem: `frontend-guilherme`
  - Consentimento: `true`
- **Resultado na Interface**: O formulário aguardou a resposta com sucesso da API pública e exibiu a tela com a mensagem *"Cadastro enviado com sucesso!"*.
- **Confirmação no Supabase**: Registro inserido com sucesso na tabela `public.leads`.
- **Confirmação no Google Sheets**: Registro sincronizado e exibido na planilha após execução do script.

## 10. Supabase — Banco de Dados Oficial

O Supabase é a fonte primária e oficial de dados do sistema.

- **Tabela**: `public.leads`
- **Segurança (RLS)**: Row Level Security habilitado.
- **Controle de Acesso**: Nenhuma chave pública anônima tem permissão para inserir registros. A gravação é estritamente realizada pelo backend usando credencial de servidor que roda no Render.
- **Normalização e Deduplicação**: A API higieniza e-mails e telefones; caso um lead com o mesmo e-mail ou telefone já exista, seus dados são atualizados (`created: false`), evitando duplicidades na base.

## 11. Google Sheets & Google Apps Script

O Google Sheets é a ferramenta utilizada para prover uma visão operacional e comercial amigável aos membros da equipe que não acessam diretamente o console do Supabase.

### Planilha de Controle
- **Nome**: `Captacao de Leads - Teste Integracao`
- **Colunas estruturadas**:
  ```text
  ID | Nome | Idade | E-mail | Telefone | Cidade | Observacoes | Origem | UTM Source | UTM Medium | UTM Campaign | Consentimento | Criado em | Atualizado em
  ```

### Google Apps Script
- **Projeto Vinculado**: `ABMIX - Sincronizacao Supabase Sheets`
- **Código Fonte**: Cópia de referência segura (sem dados sensíveis) em [`docs/google-sheets-sync.gs`](docs/google-sheets-sync.gs).
- **Função Principal**: `sincronizarLeads()`
- **Segurança das Chaves**: As credenciais do banco estão cadastradas exclusivamente nas **Propriedades do Script** do Apps Script (`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE`), mantendo o código-fonte limpo e protegido.
- **Acionador Automático Baseado em Tempo**: Foi configurado um **Time-driven Trigger** no console do Apps Script que executa automaticamente a função `sincronizarLeads` de forma periódica, espelhando os novos leads do Supabase para a planilha sem intervenção manual.

## 12. Situação Atual do Frontend (`formulario-teste`)

O frontend é uma aplicação React moderna mantida no repositório `Abmix-tech-Programacao/formulario-teste`.

### Status da Integração
- **Uso da API Pública**: O código do formulário (`formulario-teste/src/routes/index.tsx`) já foi alterado e consome diretamente a API em nuvem no Render:
  ```ts
  const response = await fetch("https://captacao-leads-mj5h.onrender.com/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: formData.fullName,
      age: Number(formData.age),
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      notes: formData.notes,
      source: "frontend-guilherme",
      consent: true,
    }),
  });
  ```
- **Feedback Condicional**: A tela de confirmação *"Cadastro enviado com sucesso!"* só é ativada após a resposta positiva da API (`200`/`201`). Se houver falha, é apresentada mensagem de erro simples sem exibir sucesso.
- **Commits Locais Salvos**: Todas as alterações de integração, mapeamento de campos e tratamento de erro estão finalizadas e salvas localmente no repositório.
- **Push Pendente**: A sincronização remota (`git push`) está pendente devido à falta de permissão de escrita (*collaborator write access*) para o usuário do desenvolvedor na organização `Abmix-tech-Programacao`.
- **Publicação Pública Pendente**: A disponibilização do formulário em uma URL web pública (ex: Cloudflare Pages, Vercel ou Netlify) segue como uma etapa pendente após a liberação do repositório.

## 13. Segurança e Boas Práticas

- **Sem Segredos no Frontend**: O frontend nunca recebe chaves `service_role` ou credenciais privadas do Supabase; ele se comunica exclusivamente via endpoint público da API.
- **Sem Segredos Versionados**: Nenhum arquivo `.env`, chave de API ou token é enviado para os repositórios Git.
- **Isolamento de Credenciais**: As chaves privilegiadas residem exclusivamente nas variáveis de ambiente do Render e nas propriedades restritas do Apps Script.
- **Proteção no Banco (RLS)**: O Supabase mantém Row Level Security ativo, impedindo leituras ou inserções não autorizadas sem chave de serviço.
- **Tamanho Limite de Requisições**: O Express limita o parsing de JSON a 32 KB para mitigar abusos e ataques de negação de serviço.

## 14. Custos Atuais das Ferramentas

A infraestrutura foi desenhada para operar na fase atual com **custo zero**, utilizando os limites gratuitos (*Free Tiers*) dos provedores:

| Serviço | Plano Utilizado | Custo Mensal | Detalhes e Limitações |
| :--- | :--- | :--- | :--- |
| **GitHub** | Free | R$ 0,00 | Versionamento de repositórios e branches |
| **Render** | Free Web Service | R$ 0,00 | 750h de computação/mês; hiberna após 15 min de inatividade |
| **Supabase** | Free Tier | R$ 0,00 | Até 500 MB de armazenamento; pausa por inatividade prolongada |
| **Google Sheets & Apps Script**| Gratuito | R$ 0,00 | Suíte do Google com cotas de execução para scripts |

### Considerações para Produção:
Para tráfego contínuo e sem latência de início a frio (*cold start* de ~50s) no Render, recomenda-se adotar o plano básico pago (Starter) e associar um domínio personalizado com certificado TLS próprio.

## 15. Histórico de Evolução do Projeto

1. **Standalone & Desacoplamento**: Migração da base original do Replit para pacotes padrão npm, tornando a API independente de workspaces proprietários.
2. **Setup do Supabase & RLS**: Modelagem da tabela `public.leads` e criação de políticas de segurança para garantir que apenas o backend consiga persistir dados.
3. **Sincronização com Google Sheets**: Criação do script no Google Apps Script para consulta via REST ao Supabase e alimentação da planilha.
4. **Deploy no Render**: Hospedagem da API Express em HTTPS no Render, validação com health check e teste via requisição direta (**"Teste API Publica ABMIX"**).
5. **Integração do Frontend**: Adaptação do formulário em React para disparar requisições para a API pública do Render com mapeamento correto dos campos.
6. **Teste Ponta a Ponta**: Validação completa da esteira com submissão via interface do formulário (**"Teste Render Frontend"**), verificação no Supabase e no Sheets.
7. **Automação Contínua**: Ativação do acionador automático temporal no Google Apps Script para sincronização periódica e autônoma.

## 16. Problemas Encontrados e Soluções

- **Dependências antigas do Replit**: O projeto exportado continha referências a workspaces internos. O backend foi convertido para execução limpa com npm.
- **`@workspace/api-zod` não encontrado**: Módulos legados foram substituídos por schemas de validação Zod diretamente no código da API.
- **Porta 3000 em uso no desenvolvimento**: Processos Node locais antigos travando a porta foram identificados e finalizados via PowerShell.
- **RLS bloqueando inserções com chave pública**: Identificado que o frontend não deve ter acesso direto ao banco; o acesso privilegiado foi centralizado no backend com chave de servidor.
- **Divergência de nomenclatura de campos**: O frontend usava campos como `fullName` e o backend esperava `name`; o mapeamento foi padronizado na função de submit.
- **Permissão de escrita no GitHub**: Durante o envio das alterações do frontend, a organização bloqueou o push por permissão de colaborador; as alterações foram salvas localmente e documentadas para liberação pela gestão.

## 17. Pendências e Próximos Passos

1. **Liberação de Permissão no GitHub**: Conceder permissão de escrita para que o desenvolvedor realize o `git push` das alterações no repositório `Abmix-tech-Programacao/formulario-teste`.
2. **Deploy Público do Frontend**: Publicar o formulário em ambiente de produção (ex: Vercel, Cloudflare Pages ou Netlify).
3. **Configuração de CORS Restrito**: Atualizar a variável `ALLOWED_ORIGINS` no Render para aceitar exclusivamente o domínio oficial do formulário publicado.
4. **Rate Limiting & Anti-Spam**: Implementar middlewares como `express-rate-limit` e proteção via Cloudflare Turnstile/hCaptcha.
5. **Integração com n8n / CRM**: Ativar o pipeline para disparos automatizados de WhatsApp e sincronização de funil com CRM.
