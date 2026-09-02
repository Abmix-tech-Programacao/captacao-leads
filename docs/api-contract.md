# Contrato da API de captação

A API recebe leads da landing page e grava os dados no Supabase. O frontend do
projeto do colega pode consumir este contrato sem conhecer a implementação do
banco ou do n8n.

## Endpoints

### `GET /api/healthz`

Retorna:

```json
{ "status": "ok" }
```

### `POST /api/leads`

Recebe JSON:

```json
{
  "name": "Nome do visitante",
  "age": 32,
  "email": "pessoa@exemplo.com",
  "phone": "(11) 99999-0000",
  "city": "São Paulo",
  "notes": "Gostaria de receber novidades.",
  "source": "landing-page",
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "campanha",
  "request_id": "opcional-idempotencia",
  "privacy_version": "v1",
  "consent": true
}
```

Campos obrigatórios: `name`, `age`, `email`, `phone`, `city` e `consent`.

- `age` deve ser um inteiro entre 1 e 120.
- `email` deve ser válido.
- `phone` deve ter entre 8 e 40 caracteres.
- `notes` aceita até 1.000 caracteres.
- `consent` deve ser `true`.
- Os campos de origem, UTM, `request_id` e versão de privacidade são opcionais.

## Respostas

Novo lead:

```http
201 Created
```

```json
{
  "success": true,
  "created": true,
  "message": "Cadastro recebido."
}
```

Lead já existente por e-mail ou telefone:

```http
200 OK
```

```json
{
  "success": true,
  "created": false,
  "message": "Cadastro atualizado."
}
```

Dados inválidos:

```http
422 Unprocessable Entity
```

```json
{
  "success": false,
  "error": "Verifique os campos informados.",
  "errors": {
    "email": "Informe um e-mail válido."
  }
}
```

Falha de configuração ou indisponibilidade do pipeline:

```http
503 Service Unavailable
```

A API nunca retorna a chave, a URL privada ou detalhes pessoais do Supabase.

## Pipeline

- `LEAD_PIPELINE_MODE=direct`: grava diretamente no Supabase.
- `LEAD_PIPELINE_MODE=n8n`: envia o mesmo payload para `N8N_WEBHOOK_URL`.

O n8n pode ser ativado depois sem alterar o contrato do frontend.