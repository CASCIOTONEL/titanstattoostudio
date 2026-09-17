# Titans Tattoo Studio — Site + Sistema do Estúdio (MVP)

Identidade visual baseada na logo enviada: fundo preto, tipografia branca condensada com brilho metálico, cinzas profundos, zero cor decorativa.

Conteúdo de exemplo agora (tatuadores, fotos, endereço, horários), fácil de trocar depois.

## Etapa 1 — Site público

- **Início**: hero com a marca Titans, headline forte, CTAs "Quero fazer minha tattoo", "Solicitar orçamento" e "Agendar".
- **Serviços**: 4 cards — Tattoo, Cobertura/Conserto, Remoção a laser, Piercing.
- **Portfólio**: galeria filtrável por tatuador e por estilo.
- **Tatuadores**: lista + página individual com especialidades e trabalhos.
- **Depoimentos**, **FAQ**, **Localização/horários/contato**, **Campanhas** (flash day, mini tattoos).
- **Rodapé** com redes, endereço e política.
- Botão flutuante de WhatsApp em todo o site.

## Etapa 2 — Orçamento + CRM

- Formulário completo: nome, WhatsApp, e-mail, nascimento, ideia, referências (upload de fotos), tamanho, local do corpo, colorido ou preto e cinza, primeiro trabalho ou cobertura, tatuador preferido, disponibilidade.
- Cada envio vira uma ficha/lead salva no sistema **e** dispara mensagem pronta no WhatsApp do estúdio.
- Funil com etapas: novo orçamento → aguardando informações → orçamento enviado → aguardando sinal → sinal pago → agendado → realizado → pós-atendimento → recorrente.
- Quadro visual (arrastar entre etapas), histórico e observações por lead.

## Etapa 3 — Agenda

- Agenda por tatuador e agenda geral, disponibilidade em tempo real.
- Duração por procedimento, bloqueio de horários, reagendamento, lista de espera e encaixe.
- Histórico de comparecimento e faltas.
- Regra central: horário só confirma depois do sinal pago.
- Lembretes: mensagem pronta para WhatsApp e e-mail automático.

## Etapa 4 — Pagamento e financeiro

- Registro de sinal, saldo, desconto, acréscimo, forma de pagamento, taxa e valor líquido.
- Contas a receber, recebimentos, pendências, estornos, cancelamentos, créditos do cliente, pacotes de sessões e parcelamento.
- Contas a pagar (aluguel, materiais, marketing, salários, impostos etc.).
- Resultado: faturamento bruto − taxas − comissões − custos − despesas − impostos = lucro.
- Pagamento online real (PIX/cartão) exige um provedor de pagamento; nesta etapa entram os registros e links, e a cobrança automática entra assim que você escolher o provedor.

## Etapa 5 — Comissões

- Regra por tatuador: percentual, valor fixo, diária, cadeira, percentual por serviço, desconto de materiais, comissão sobre sinal ou só sobre serviço concluído.
- Cálculo automático a cada procedimento realizado.
- Fechamento por período: produção, faturamento, comissão, pago e a pagar.

## Etapa 6 — Ficha, documentos e painel

- Ficha digital do cliente: dados, fotos antes/depois, histórico de sessões, responsável, observações.
- Termos digitais: consentimento, uso de imagem, política de sinal/cancelamento, com assinatura eletrônica na tela.
- Pós-atendimento: cuidados, mensagem de acompanhamento, pedido de avaliação e lembrete de retoque.
- Painel com faturamento do mês, ticket médio, tattoos realizadas, novos clientes, recorrentes, orçamentos, taxa de conversão, sinais, a receber, faturamento por tatuador e lucro estimado.
- Acessos por perfil: recepção, tatuador, financeiro, administrador.
- LGPD: consentimento, controle de acesso e política de privacidade.

## Fase 2 (depois do MVP)

Automações avançadas de WhatsApp, fidelidade/cashback, vouchers e vale-presente, cupons, campanhas segmentadas, BI e relatórios avançados, conciliação bancária.

## Detalhes técnicos

- Ativar Lovable Cloud (banco, login, upload de arquivos e funções de servidor).
- Tabelas: profiles, user_roles (perfis de acesso), artists, services, leads, lead_events, clients, appointments, payments, commissions, expenses, documents, testimonials, portfolio_items, campaigns. RLS em todas, com GRANTs e função `has_role` para permissões.
- Área administrativa protegida em `/admin`, com rotas por módulo; site público em rotas próprias (`/`, `/servicos`, `/portfolio`, `/tatuadores/$slug`, `/orcamento`, `/contato`, `/faq`) e metadados de SEO por página.
- Upload de referências e fotos no storage do Cloud.
- WhatsApp na primeira versão via link pré-preenchido (`wa.me`); API oficial fica para a fase 2.
- Tokens de design em `src/styles.css`: preto, grafite, prata metálico; sem cores de destaque.

## Entrega

Começo pela Etapa 1 e sigo pelas etapas em sequência, mostrando cada bloco funcionando antes de avançar.
