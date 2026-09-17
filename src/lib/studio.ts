import tattoo1 from "@/assets/tattoo-1.jpg";
import tattoo2 from "@/assets/tattoo-2.jpg";
import tattoo3 from "@/assets/tattoo-3.jpg";
import tattoo4 from "@/assets/tattoo-4.jpg";
import tattoo5 from "@/assets/tattoo-5.jpg";
import tattoo6 from "@/assets/tattoo-6.jpg";

export const studio = {
  name: "Titans Tattoo Studio",
  phoneDisplay: "(11) 99999-0000",
  whatsapp: "5511999990000",
  email: "contato@titanstattoo.com.br",
  address: "Rua Exemplo, 123 — Vila Madalena, São Paulo/SP",
  instagram: "@titanstattoo",
  hours: [
    { day: "Segunda a sexta", time: "11h às 20h" },
    { day: "Sábado", time: "10h às 18h" },
    { day: "Domingo", time: "Fechado" },
  ],
};

export function whatsappLink(message: string) {
  return `https://wa.me/${studio.whatsapp}?text=${encodeURIComponent(message)}`;
}

export type Service = {
  slug: string;
  name: string;
  short: string;
  description: string;
  points: string[];
};

export const services: Service[] = [
  {
    slug: "tattoo",
    name: "Tattoo",
    short: "Projetos autorais em preto e cinza, realismo, fine line e blackwork.",
    description:
      "Do primeiro rascunho à sessão final. Desenvolvemos o projeto junto com você, ajustamos tamanho e posicionamento no corpo e executamos com material descartável e equipamento profissional.",
    points: ["Projeto autoral", "Sessões de 1h a 8h", "Orçamento sem compromisso"],
  },
  {
    slug: "cobertura",
    name: "Cobertura e conserto",
    short: "Transformamos tatuagens antigas ou malfeitas em um trabalho novo.",
    description:
      "Avaliamos a pele, a densidade do pigmento antigo e propomos o caminho certo: cobertura completa, reforço ou clareamento prévio a laser antes de cobrir.",
    points: ["Avaliação presencial", "Plano em etapas", "Clareamento quando necessário"],
  },
  {
    slug: "remocao-laser",
    name: "Remoção a laser",
    short: "Clareamento e remoção com laser Q-Switched em sessões espaçadas.",
    description:
      "Protocolo com número de sessões estimado na avaliação, cuidados pós-sessão e acompanhamento fotográfico da evolução.",
    points: ["Avaliação da pele", "Sessões a cada 45 dias", "Registro antes e depois"],
  },
  {
    slug: "piercing",
    name: "Piercing",
    short: "Aplicação com material esterilizado e joias em titânio.",
    description:
      "Perfurações de orelha, corpo e face com técnica asséptica, joias de titânio ASTM F-136 e orientação completa de cicatrização.",
    points: ["Titânio implant grade", "Sala esterilizada", "Acompanhamento da troca"],
  },
];

export type Artist = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  specialties: string[];
  works: { src: string; alt: string }[];
};

export const artists: Artist[] = [
  {
    slug: "ricardo-vale",
    name: "Ricardo Vale",
    role: "Realismo preto e cinza",
    bio: "Doze anos de estrada, especializado em retratos e animais em preto e cinza. Trabalha com sessões longas e projetos de braço fechado.",
    specialties: ["Realismo", "Retrato", "Fechamento de braço"],
    works: [
      { src: tattoo1, alt: "Tatuagem de leão em realismo preto e cinza no antebraço" },
      { src: tattoo5, alt: "Retrato realista tatuado no ombro" },
    ],
  },
  {
    slug: "helena-cruz",
    name: "Helena Cruz",
    role: "Fine line e minimalismo",
    bio: "Traço fino, composições delicadas e lettering. Atende muito primeiro trabalho e projetos pequenos com acabamento impecável.",
    specialties: ["Fine line", "Minimalismo", "Lettering"],
    works: [
      { src: tattoo2, alt: "Tatuagem fine line de montanhas no braço" },
      { src: tattoo6, alt: "Lettering delicado tatuado no pulso" },
    ],
  },
  {
    slug: "diego-matos",
    name: "Diego Matos",
    role: "Blackwork e ornamental",
    bio: "Padrões ornamentais, mandalas e blackwork pesado. Especialista em cobertura de trabalhos antigos.",
    specialties: ["Blackwork", "Ornamental", "Cobertura"],
    works: [
      { src: tattoo3, alt: "Braço fechado em blackwork ornamental" },
      { src: tattoo4, alt: "Tatuagem de cobra e adaga na perna" },
    ],
  },
];

export type PortfolioItem = {
  id: string;
  src: string;
  alt: string;
  style: string;
  artist: string;
};

export const portfolio: PortfolioItem[] = [
  { id: "1", src: tattoo1, alt: "Leão em realismo preto e cinza", style: "Realismo", artist: "Ricardo Vale" },
  { id: "2", src: tattoo3, alt: "Braço fechado ornamental", style: "Blackwork", artist: "Diego Matos" },
  { id: "3", src: tattoo2, alt: "Montanhas em fine line", style: "Fine line", artist: "Helena Cruz" },
  { id: "4", src: tattoo5, alt: "Retrato realista no ombro", style: "Realismo", artist: "Ricardo Vale" },
  { id: "5", src: tattoo4, alt: "Cobra e adaga na perna", style: "Blackwork", artist: "Diego Matos" },
  { id: "6", src: tattoo6, alt: "Lettering no pulso", style: "Fine line", artist: "Helena Cruz" },
];

export const testimonials = [
  {
    name: "Marina L.",
    text: "Fiz minha primeira tattoo com a Helena e fui tratada com uma paciência absurda. O traço ficou perfeito e a cicatrização foi tranquila.",
    service: "Fine line",
  },
  {
    name: "Bruno A.",
    text: "Cobri uma tatuagem de 15 anos atrás com o Diego. O estúdio é impecável e o resultado passou muito do que eu esperava.",
    service: "Cobertura",
  },
  {
    name: "Carla S.",
    text: "Três sessões com o Ricardo para fechar o braço. Organização, horário respeitado e um realismo de outro nível.",
    service: "Realismo",
  },
];

export const faq = [
  {
    q: "Como funciona o orçamento?",
    a: "Você preenche o formulário de orçamento com a ideia, referências, tamanho e local do corpo. Respondemos com valor estimado e disponibilidade do tatuador escolhido.",
  },
  {
    q: "Preciso pagar sinal para agendar?",
    a: "Sim. O horário só fica confirmado após o pagamento do sinal, que é abatido do valor final da tatuagem.",
  },
  {
    q: "Posso remarcar?",
    a: "Pode, com no mínimo 48 horas de antecedência. Remarcações em cima da hora ou faltas fazem o sinal ser retido.",
  },
  {
    q: "Menor de idade pode tatuar?",
    a: "Não realizamos procedimentos em menores de 18 anos, mesmo com autorização dos responsáveis.",
  },
  {
    q: "Quanto tempo leva a cicatrização?",
    a: "A pele fecha em cerca de 15 dias e a cicatrização profunda leva até 60 dias. Você recebe todas as orientações por escrito após a sessão.",
  },
  {
    q: "Vocês fazem retoque?",
    a: "Sim, um retoque de acabamento é gratuito em até 90 dias, desde que os cuidados tenham sido seguidos.",
  },
];

export const campaigns = [
  {
    title: "Flash Day",
    date: "Último sábado do mês",
    text: "Desenhos exclusivos prontos para tatuar, valor fechado e atendimento por ordem de chegada.",
  },
  {
    title: "Mini tattoos",
    date: "Terças e quartas",
    text: "Peças de até 5 cm com agenda rápida e preço promocional.",
  },
  {
    title: "Indique um amigo",
    date: "Sempre ativo",
    text: "Indicou e a pessoa tatuou? Você ganha crédito na sua próxima sessão.",
  },
];
