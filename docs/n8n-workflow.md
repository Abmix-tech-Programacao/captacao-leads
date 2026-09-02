# Workflow n8n — captação de leads

O n8n será executado externamente e receberá os cadastros pelo webhook da
landing page. O backend pode alternar para este pipeline com
`LEAD_PIPELINE_MODE=n8n` e `N8N_WEBHOOK_URL`.

## Fluxo principal

```text
Webhook POST
    ↓
Validar entrada
    ↓
Normalizar dados
    ↓
Verificar duplicidade
    ↓
Salvar no Supabase
    ├──→ Responder sucesso à landing page
    └──→ Adicionar/atualizar linha no Google Sheets
```

## Regras

1. Aceitar apenas JSON e limitar o volume de requisições.
2. Revalidar nome, idade, e-mail, telefone, cidade, observações e consentimento.
3. Gerar `email_normalized`, `phone_normalized`, `request_id`,
   `consent_at`, `privacy_version` e `status`.
4. Procurar duplicidade por e-mail normalizado ou telefone normalizado.
5. Atualizar o lead existente, mantendo o mesmo `id`, em vez de criar uma segunda
   pessoa.
6. Usar credencial de servidor guardada no próprio n8n; nunca expor essa
   credencial no frontend ou neste repositório.
7. Registrar o lead no Supabase antes de atualizar a planilha.
8. Uma falha no Google Sheets não pode apagar um lead já salvo no Supabase;
   registrar a falha para reprocessamento.
9. Evitar e-mail, telefone e observações completos nos logs.

## Critério de pronto

- Cadastro válido cria ou atualiza uma linha no Supabase.
- O mesmo e-mail não cria uma segunda pessoa.
- O telefone normalizado participa da deduplicação.
- A resposta de sucesso chega à landing page.
- A planilha recebe o registro.
- Dados inválidos não são persistidos.