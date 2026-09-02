# Captação de Leads ABMIX

Projeto de captação de leads com frontend desacoplado, API própria em Express/TypeScript, banco Supabase e visão operacional no Google Sheets.

## Estado atual — 02/09/2026

### Concluído
- Backend independente do Replit em `artifacts/api-server`.
- Dependências instaladas com npm.
- `GET /api/healthz` testado com sucesso em `http://localhost:3000`.
- `POST /api/leads` testado com sucesso.
- Supabase configurado como banco principal.
- Tabela `public.leads` criada com RLS habilitado.
- Gravação real de lead no Supabase validada.
- Deduplicação por e-mail/telefone preparada.
- Google Sheets `Captacao de Leads - Teste Integracao` configurado como visão operacional.
- Google Apps Script `ABMIX - Sincronizacao Supabase Sheets` configurado.
- Sincronização Supabase → Google Sheets executada e validada com sucesso.
- Lead `Lead Teste ABMIX` confirmado tanto no Supabase quanto no Google Sheets.
- Frontend do colaborador `guilhermemottabmix/formulario-teste` clonado localmente e dependências instaladas com sucesso.

### Em finalização
- Alterar o submit do frontend do Guilherme para chamar a API ABMIX.
- Testar o fluxo completo pelo formulário.
- Configurar atualização automática do Google Sheets (opcional para o teste final; hoje a função já sincroniza manualmente).
- Publicar/hospedar a API para uso fora do computador local.

## Arquitetura validada

```text
Frontend / formulário
        ↓
POST /api/leads
        ↓
API Express + TypeScript
        ↓
Supabase REST API
        ↓
public.leads
        ↓
Google Apps Script
        ↓
Google Sheets
```

No teste atual a API roda localmente na porta `3000`. Para produção será necessário publicar o backend em uma URL HTTPS.

## Estrutura principal

```text
captacao-leads/
├── artifacts/
│   └── api-server/
│       ├── src/
│       ├── package.json
│       ├── package-lock.json (gerado localmente pelo npm)
│       └── .env (local e não versionado)
├── docs/
│   ├── google-sheets-sync.gs
│   └── n8n-workflow.md
├── lib/
└── README.md
```

O frontend do Guilherme está em um repositório separado: `guilhermemottabmix/formulario-teste`. Durante o desenvolvimento ele foi clonado localmente dentro da pasta de trabalho para permitir o teste integrado, mas continua sendo um repositório Git independente.

## 1. Rodando o backend

No PowerShell, a partir da raiz deste projeto:

```powershell
Set-Location .\artifacts\api-server
npm install
npm start
```

Quando estiver funcionando:

```text
"port":3000
"msg":"Server listening"
```

Se aparecer `EADDRINUSE`, significa que já existe outro processo usando a porta 3000. Para localizar o processo:

```powershell
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
```

Para conferir o processo:

```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess
```

## 2. Variáveis de ambiente

Arquivo local: `artifacts/api-server/.env`

```text
LEAD_PIPELINE_MODE=direct
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SECRET_KEY=SUA_CHAVE_DE_SERVIDOR
N8N_WEBHOOK_URL=
ALLOWED_ORIGINS=
PORT=3000
```

### Segurança
- Nunca versionar `.env`.
- Nunca colocar `service_role`, secret key ou outra credencial no frontend.
- Nunca colocar chaves reais no README.
- A URL do projeto Supabase não substitui a chave de servidor.
- A credencial usada pelo backend deve permanecer somente no servidor.

O `.gitignore` está preparado para ignorar `.env` e arquivos derivados.

## 3. Teste de saúde da API

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/healthz" -Method Get
```

Resposta validada:

```text
status
------
ok
```

## 4. Cadastro de lead pela API

Exemplo validado:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/leads" -Method Post -ContentType "application/json" -Body '{"name":"Lead Teste ABMIX","age":38,"email":"teste.integracao@abmix.tech","phone":"11999999999","city":"Sao Paulo","notes":"Teste final API Supabase","source":"antigravity","consent":true}'
```

Resposta obtida:

```text
success : True
created : True
message : Cadastro recebido.
```

## 5. Contrato de dados

Campos principais:
- `name`
- `age`
- `email`
- `phone`
- `city`
- `consent`

Campos opcionais:
- `notes`
- `source`
- `utm_source`
- `utm_medium`
- `utm_campaign`
- `request_id`
- `privacy_version`

A API normaliza e-mail e telefone e verifica duplicidade antes de criar um novo lead.

## 6. Supabase

O Supabase é a fonte principal dos dados.

Tabela utilizada:

```text
public.leads
```

Fluxo atual:
1. API recebe o JSON.
2. Valida os campos.
3. Normaliza e-mail e telefone.
4. Verifica se o lead já existe.
5. Cria ou atualiza o registro.
6. Retorna o resultado para o cliente.

RLS permanece habilitado. A operação privilegiada ocorre somente pelo backend usando credencial de servidor.

## 7. Google Sheets

Planilha usada no teste:

```text
Captacao de Leads - Teste Integracao
```

Colunas configuradas:

```text
ID | Nome | Idade | E-mail | Telefone | Cidade | Observacoes | Origem | UTM Source | UTM Medium | UTM Campaign | Consentimento | Criado em | Atualizado em
```

O Google Sheets é a visão operacional/comercial. O Supabase continua sendo o banco principal.

## 8. Google Apps Script

Projeto criado:

```text
ABMIX - Sincronizacao Supabase Sheets
```

Propriedades do script configuradas:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE
```

Os valores reais não são versionados.

Função utilizada:

```text
sincronizarLeads
```

Uma cópia segura do código, sem credenciais, está em:

```text
docs/google-sheets-sync.gs
```

A execução manual foi autorizada e concluída com sucesso. O lead de teste apareceu na linha 2 da planilha.

Para operação contínua, pode-se criar um Acionador no Apps Script para executar `sincronizarLeads` periodicamente.

## 9. Frontend do Guilherme

Repositório:

```text
guilhermemottabmix/formulario-teste
```

O frontend contém formulário com:
- nome completo;
- idade;
- telefone/WhatsApp;
- e-mail;
- cidade;
- observações.

No código original, após a validação o formulário apenas exibe a mensagem de sucesso. A etapa final é substituir esse comportamento por uma chamada HTTP para a API.

Destino local do teste:

```text
POST http://localhost:3000/api/leads
```

Mapeamento esperado:

```text
fullName → name
age → age
phone → phone
email → email
city → city
notes → notes
source → frontend-guilherme
consent → true
```

Para produção, a URL da API deverá vir de uma variável de ambiente do frontend (por exemplo `VITE_API_URL`) e nunca deverá conter chaves do Supabase.

## 10. Frontend local

O repositório do Guilherme foi clonado dentro da pasta de trabalho:

```powershell
git clone https://github.com/guilhermemottabmix/formulario-teste.git
Set-Location .\formulario-teste
npm install
```

A instalação realizada em 02/09/2026 adicionou 415 pacotes e reportou `0 vulnerabilities`.

## 11. n8n — futuro

O n8n não é necessário para a integração básica atual. O backend mantém suporte planejado para:

```text
LEAD_PIPELINE_MODE=n8n
N8N_WEBHOOK_URL=https://seu-n8n.example/webhook/leads
```

Ele poderá ser usado posteriormente para WhatsApp, e-mail, CRM, distribuição de leads, notificações e outras automações.

## 12. Problemas encontrados e soluções

### Dependências antigas do Replit
O projeto exportado dependia de pacotes de workspace e conectores do Replit. O backend foi convertido para execução standalone com npm.

### `@workspace/api-zod` não encontrado
A rota de saúde ainda dependia do workspace antigo. A dependência foi removida da rota standalone.

### `pino-pretty` não encontrado
O logger tentava carregar um transport que não estava instalado. A configuração foi simplificada para o logger padrão do Pino.

### Porta 3000 já em uso
Foi identificado um processo Node antigo usando a porta. O processo foi localizado pelo PID, encerrado e o backend foi reiniciado.

### Chave Supabase inválida
Durante a configuração, um comando PowerShell acabou sendo gravado no `.env` no lugar da chave. A credencial foi novamente capturada de forma segura e salva sem exibi-la no chat ou GitHub.

### RLS bloqueando gravação
A primeira tentativa com chave pública não tinha permissão para gravar. O acesso servidor foi configurado para o backend, mantendo a chave fora do frontend.

### Formato dos campos
O backend usa nomes como `name`, `age`, `phone`, `city` e `consent`. O frontend usa nomes próprios de interface, então o submit precisa mapear esses campos para o contrato da API.

## 13. Custos da arquitetura de teste

Na fase atual, o projeto foi estruturado para aproveitar planos gratuitos disponíveis de GitHub, Supabase, Google Sheets e Google Apps Script, além da execução local do backend. Limites e preços desses serviços podem mudar e devem ser conferidos antes de produção.

Uma publicação real poderá adicionar custo de hospedagem do backend, domínio, mensageria/WhatsApp, n8n ou outros serviços escolhidos posteriormente.

## 14. Checklist antes de produção

- Publicar a API em HTTPS.
- Restringir CORS para os domínios autorizados.
- Adicionar rate limiting/anti-spam.
- Validar política de privacidade e consentimento/LGPD.
- Configurar monitoramento e logs.
- Definir backup e retenção de dados.
- Configurar sincronização automática do Google Sheets, se ela continuar necessária.
- Testar o frontend publicado contra a API publicada.
- Nunca expor credenciais do Supabase no navegador.

## Resultado esperado final

```text
Usuário preenche formulário
        ↓
Frontend do Guilherme
        ↓
API ABMIX
        ↓
Supabase (banco oficial)
        ↓
Google Sheets (visão comercial)
        ↓
Futuro: n8n / WhatsApp / e-mail / CRM
```

Este README deve ser atualizado sempre que houver uma alteração importante na arquitetura, configuração ou fluxo do projeto.
