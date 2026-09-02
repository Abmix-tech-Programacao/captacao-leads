# Captação de Leads

API para receber cadastros de uma landing page, validar os dados, deduplicar
leads e armazená-los no Supabase. O projeto mantém o frontend desacoplado para
ser integrado posteriormente ao frontend de outro colaborador.

## Estado atual

- API Express em `artifacts/api-server`
- Contrato OpenAPI em `lib/api-spec/openapi.yaml`
- Validação gerada com Zod
- Supabase como fonte oficial dos dados
- Pipeline direto como padrão
- Pipeline n8n preparado para ativação futura
- Google Sheets planejado como visão operacional, não como fonte primária

## Rodar localmente

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
```

O serviço usa a porta fornecida pelo workflow do Replit.

## Endpoints

### `GET /api/healthz`

Verifica se o serviço está respondendo.

### `POST /api/leads`

Recebe `name`, `age`, `email`, `phone`, `city` e `consent`, além de campos
opcionais de observações, origem e UTMs. A API normaliza e-mail/telefone,
registra o consentimento e atualiza um lead existente quando o e-mail ou
telefone já estiver cadastrado.

O contrato completo está em [`docs/api-contract.md`](docs/api-contract.md).

## Configuração

O conector Supabase gerenciado pelo Replit deve estar vinculado ao projeto com
uma credencial de servidor que possa gravar em `public.leads` respeitando a
política de RLS. A credencial nunca deve ser colocada no frontend, no README ou
no GitHub.

Para usar o n8n posteriormente:

```text
LEAD_PIPELINE_MODE=n8n
N8N_WEBHOOK_URL=https://seu-n8n.example/webhook/leads
```

Veja [`docs/n8n-workflow.md`](docs/n8n-workflow.md) para o desenho do fluxo.

## Verificação

```bash
pnpm run typecheck
pnpm --filter @workspace/api-spec run codegen
```

O typecheck passa no workspace atual. A gravação real depende da conexão
Supabase usar uma credencial de servidor; uma chave anon é bloqueada pela RLS
intencionalmente.

## Segurança

- RLS permanece ativo no Supabase.
- A API limita o corpo JSON a 32 KB.
- Logs não registram o conteúdo do lead.
- Erros retornados ao frontend não expõem detalhes do provedor.
- Rate limit e proteção anti-spam devem ser adicionados antes da publicação.