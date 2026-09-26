# Fase 2 — Execução completa

O quadro Kanban já está pronto. Os outros quatro itens serão feitos em sequência, e cada um será testado antes de passar para o próximo.

## 1. Ficha de anamnese e termo de consentimento digital
- Página pública `/ficha/$token`: o cliente abre pelo link (WhatsApp) ou num tablet na recepção.
- Campos de saúde: alergias, diabetes, hipertensão, queloide, hemofilia, gestante/lactante, medicamentos, doenças de pele, uso de álcool ou drogas nas últimas 24h, observações.
- Termos: consentimento do procedimento, uso de imagem (opcional), política de sinal e cancelamento, e aceite LGPD.
- Assinatura com o dedo ou o mouse na tela, salva como imagem.
- Na tela Clientes, o botão "Gerar ficha" cria o link e permite enviá-lo pelo WhatsApp. A ficha assinada fica no histórico do cliente, com data e hora, e pode ser impressa.

## 2. Guia de pós-atendimento
- Página pública `/cuidados` com as orientações do Titans: plástico, lavagem, pomada, sol, praia e piscina, alimentação e retoque em cerca de 30 dias.
- No quadro de orçamentos, a coluna Concluído ganha o botão "Enviar cuidados", que abre o WhatsApp do cliente com a mensagem pronta e o link.
- Os textos serão um padrão sugerido. Depois você revisa e me passa a versão oficial do estúdio.

## 3. Despesas e lucro líquido
- Nova aba "Despesas" em Pagamentos, com data, categoria, descrição, valor e forma de pagamento. Categorias: materiais, tintas, aluguel, internet/luz, taxas de máquina, marketing, impostos e outros.
- Resumo do mês: entradas − comissões (60%) − despesas = lucro líquido do estúdio, com totais por categoria.
- Acesso só para financeiro e master.

## 4. Galeria de trabalhos por cliente
- Na ficha do cliente, envio de fotos do trabalho finalizado (antes e depois), com data e tatuador.
- Galeria com as fotos em ordem de data e opção de ampliar. Arquivos privados, vistos só pela equipe.

## Detalhes técnicos
- Tabelas novas: `fichas_anamnese` (cliente_id, token único, respostas jsonb, aceites, assinatura_path, assinada_em), `despesas` e `cliente_fotos`. Todas com GRANTs, RLS usando `pode_ver_orcamentos` e `pode_ver_financeiro`, exclusão só pelo master, e trigger de `updated_at`.
- A ficha pública lê e grava por meio de server functions validadas com Zod, usando o token (sem acesso direto do visitante às tabelas). O token vence depois de 7 dias ou quando a ficha é assinada.
- Buckets privados `assinaturas` e `trabalhos`, com URLs assinadas.
- A assinatura usa canvas nativo, sem biblioteca externa.
- O `roadmap.md` e o ERD serão atualizados.
