# Captação de Leads

API para receber cadastros, validar os dados, deduplicar leads e armazená-los no Supabase. O frontend permanece desacoplado para integração posterior com o formulário do colaborador `guilhermemottabmix/formulario-teste`.

## Estado atual

- API Express/TypeScript em `artifacts/api-server`
- Backend independente do Replit
- `GET /api/healthz` funcionando localmente
- `POST /api/leads` funcionando localmente
- Supabase como fonte oficial dos dados
- Gravação real de lead no Supabase validada em 02/09/2026
- Deduplicação por e-mail ou telefone preparada
- Pipeline direto como padrão
- Pipeline n8n mantido para ativação futura
- Google Sheets será a visão operacional/comercial, não a fonte primária
- Frontend do Guilherme será conectado posteriormente à rota `POST /api/leads`

## Arquitetura atual

```text
Frontend de teste / PowerShell
        ↓
POST /api/leads
        ↓
API Express local (porta 3000)
        ↓
Supabase REST API
        ↓
Tabela public.leads
        ↓
Google Sheets (próxima etapa)
```

## Rodar localmente

Entre na pasta do backend:

```powershell
Set-Location .\artifacts\api-server
npm install
npm start
```

O servidor usa a porta `3000` por padrão.

Quando estiver funcionando, o terminal mostra algo semelhante a:

```text
"port":3000
"msg":"Server listening"
```

## Variáveis de ambiente

Crie um arquivo `.env` dentro de `artifacts/api-server` com esta estrutura:

```text
LEAD_PIPELINE_MODE=direct
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SECRET_KEY=SUA_CHAVE_DE_SERVIDOR
N8N_WEBHOOK_URL=
ALLOWED_ORIGINS=
PORT=3000
```

A chave usada no teste local foi a `service_role` do Supabase. Ela é uma credencial de servidor e nunca deve ser colocada no frontend, README, commits ou GitHub.

O `.gitignore` ignora arquivos `.env` e preserva apenas `.env.example`.

## Endpoints

### `GET /api/healthz`

Verifica se o serviço está respondendo.

Exemplo:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/healthz" -Method Get
```

Resposta esperada:

```text
status
------
ok
```

### `POST /api/leads`

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

Exemplo de teste local:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/leads" -Method Post -ContentType "application/json" -Body '{"name":"Lead Teste ABMIX","age":38,"email":"teste.integracao@abmix.tech","phone":"11999999999","city":"Sao Paulo","notes":"Teste final API Supabase","source":"antigravity","consent":true}'
```

Resposta validada em 02/09/2026:

```text
success : True
created : True
message : Cadastro recebido.
```

## Supabase

A API grava diretamente em `public.leads` usando a REST API do Supabase.

A lógica atual:

1. normaliza e-mail e telefone;
2. procura lead existente por e-mail ou telefone;
3. cria um novo registro quando não encontra duplicidade;
4. atualiza o registro existente quando encontra o mesmo contato.

RLS pode permanecer ativo porque o backend usa uma credencial de servidor.

## Segurança

- `.env` não é versionado.
- Chaves do Supabase não devem ser colocadas no frontend.
- Logs não devem registrar credenciais.
- A API limita o corpo JSON.
- Erros enviados ao frontend não expõem a resposta completa do provedor.
- Rate limit e proteção anti-spam devem ser adicionados antes de publicação externa.

## Integração com o frontend do Guilherme

Frontend de referência:

```text
guilhermemottabmix/formulario-teste
```

A integração final será feita apontando o envio do formulário para:

```text
POST /api/leads
```

O backend aceita JSON e espera os nomes de campos em inglês (`name`, `age`, `email`, `phone`, `city`, `consent`). O frontend pode continuar exibindo os rótulos em português; apenas o objeto enviado à API precisa seguir o contrato acima.

## Próxima etapa

A próxima etapa do projeto é:

```text
Supabase → Google Sheets
```

Objetivo: manter o Supabase como banco oficial e enviar cada lead para uma planilha comercial para consulta simples da equipe.

Depois disso:

```text
Frontend do Guilherme → API → Supabase → Google Sheets
```

## n8n

O n8n não é necessário para o teste atual. A integração permanece preparada para uso futuro:

```text
LEAD_PIPELINE_MODE=n8n
N8N_WEBHOOK_URL=https://seu-n8n.example/webhook/leads
```

Veja `docs/n8n-workflow.md` para o desenho do fluxo futuro.
