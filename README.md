# Captação de Leads

Projeto de automação para captar novos cadastros em uma landing page e organizar os leads para futura venda.

> Status: planejamento — a configuração técnica ainda não foi iniciada.

## Objetivo

Criar uma landing page exclusiva para captação de leads com os campos:

- Nome
- Idade
- E-mail
- Telefone/WhatsApp
- Cidade
- Observações
- Consentimento para contato e política de privacidade

Após o envio, o cadastro deve ser validado, protegido contra duplicidade, salvo em um banco de dados e disponibilizado em uma planilha operacional.

## Arquitetura recomendada

```text
VISITANTE
   ↓ HTTPS
LANDING PAGE
   ↓ formulário
WEBHOOK/API DO N8N
   ↓ validação + normalização + deduplicação
SUPABASE — fonte oficial dos dados
   ↓ sincronização
GOOGLE SHEETS — planilha completa de leads
   ↓
FUTURA VENDA / CONTATO COMERCIAL
```

No MVP, o webhook do n8n funciona como a API de entrada. Uma API separada só será criada quando outros sistemas precisarem consumir os leads.

## Ferramentas escolhidas

| Componente | Escolha inicial | Motivo |
|---|---|---|
| Desenvolvimento | Google Antigravity | Trabalho orientado por agentes em um projeto versionado |
| Versionamento | GitHub | Histórico, README e colaboração desde o primeiro commit |
| Landing page | Página própria | Controle de marca e possibilidade de evolução |
| Automação | n8n | Orquestração visual com webhooks e integrações |
| Banco principal | Supabase | PostgreSQL gerenciado e API sobre os dados |
| Saída comercial | Google Sheets | Consulta simples e exportação para vendas |
| IA | Fora do MVP | Não é necessária para cadastrar leads |

## Fluxo do lead

1. O visitante acessa a landing page.
2. Preenche o formulário.
3. A entrada é validada.
4. O n8n recebe o cadastro pelo webhook.
5. E-mail e telefone são normalizados.
6. O sistema verifica duplicidade.
7. O lead é gravado no Supabase.
8. O registro é sincronizado com a Google Sheets.
9. O visitante recebe uma confirmação.
10. O lead fica disponível para contato e futura venda.

## Dados do lead

### Dados informados

- Nome
- Idade
- E-mail
- Telefone/WhatsApp
- Cidade
- Observações

### Dados operacionais

- ID do lead
- Data de cadastro
- Status
- Responsável
- Prioridade
- Último contato
- Próxima ação
- Origem e campanhas (UTM)

### Dados de privacidade

- Consentimento para contato
- Data e hora do consentimento
- Versão do aviso de privacidade
- Política de retenção

Status sugeridos: `novo`, `contatado`, `qualificado`, `convertido`, `não interessado`.

## Fonte oficial e planilha

O Supabase será a fonte oficial dos dados. A Google Sheets será uma visão operacional ou cópia sincronizada para acompanhamento comercial.

A planilha não deve ser o único banco do sistema, pois isso dificulta deduplicação, permissões, histórico e crescimento.

## Segurança e privacidade

- Usar HTTPS em toda a jornada.
- Não colocar chaves ou segredos no código do navegador.
- Validar e limitar requisições no endpoint público.
- Usar proteção anti-spam e, se necessário, CAPTCHA/Turnstile.
- Evitar dados pessoais completos nos logs.
- Restringir acesso ao banco por permissões mínimas.
- Registrar consentimento e finalidade do contato.
- Definir prazo de retenção e processo de exclusão.
- Definir o tratamento para pessoas menores de idade.

Este documento descreve decisões de produto e arquitetura; não constitui garantia automática de conformidade com a LGPD.

## Testes planejados

- Cadastro válido.
- Campos obrigatórios vazios.
- E-mail inválido.
- Telefone inválido.
- Idade fora da regra definida.
- Lead duplicado por e-mail ou telefone.
- Duplo clique no envio.
- Falha do n8n, do banco ou da planilha.
- Tentativa de spam.
- Uso em celular.
- Ausência de segredos no frontend.
- Confirmação sem exposição de dados pessoais.

## Custos de referência

Os valores variam por região, impostos, câmbio e volume de uso.

- n8n Cloud: Starter a partir de €20/mês no pagamento anual; Pro a partir de €50/mês.
- Supabase: plano Free para MVP; Pro a partir de US$25/mês.
- Tally: alternativa no-code com plano gratuito; Pro a partir de US$24/mês.
- Hospedagem da página: avaliar Vercel ou equivalente conforme uso comercial.

## Roadmap

### Fase 1 — Planejamento

- [x] Definir objetivo
- [x] Definir arquitetura simples
- [x] Definir campos do lead
- [x] Definir ferramentas candidatas
- [x] Criar README inicial

### Fase 2 — MVP

- [ ] Construir landing page
- [ ] Definir identidade visual e texto da oferta
- [ ] Criar fluxo de entrada no n8n
- [ ] Criar estrutura do banco
- [ ] Criar planilha operacional
- [ ] Validar testes principais

### Fase 3 — Operação

- [ ] Publicar a landing page
- [ ] Monitorar falhas e duplicidades
- [ ] Definir rotina de contato
- [ ] Medir origem e conversão dos leads

### Fase 4 — Evolução

- [ ] Adicionar painel de acompanhamento
- [ ] Integrar CRM ou WhatsApp, se necessário
- [ ] Avaliar classificação automática com IA
- [ ] Criar API pública versionada somente se houver necessidade

## Decisões importantes

1. Começar simples: n8n como webhook/API de entrada.
2. Ter apenas uma fonte oficial: Supabase.
3. Usar Google Sheets como saída operacional, não como banco principal.
4. Não usar IA no cadastro inicial.
5. Versionar decisões e código no GitHub desde o primeiro commit.
6. Trabalhar no repositório com o Google Antigravity.

## Próximo passo

Depois deste README, o projeto deve passar por uma definição visual da landing page e pela confirmação do texto da oferta. A configuração técnica do n8n, Supabase e hospedagem será feita somente na etapa seguinte.
