import cascioPhoto from "@/assets/artist-cascio.jpg.asset.json";
import ricardoPhoto from "@/assets/artist-ricardo.jpg.asset.json";
import braianPhoto from "@/assets/artist-braian.jpg.asset.json";
import cascio6077 from "@/assets/cascio-6077-unified.jpg.asset.json";
import cascio6108 from "@/assets/cascio-6108-unified.jpg.asset.json";
import cascio6155 from "@/assets/cascio-6155-unified.jpg.asset.json";
import cascio6197 from "@/assets/cascio-6197-unified.jpg.asset.json";
import cascio6460 from "@/assets/cascio-6460-unified.jpg.asset.json";
import cascio6509 from "@/assets/cascio-6509-unified.jpg.asset.json";
import cascio6535 from "@/assets/cascio-6535-unified.jpg.asset.json";
import cascio7138 from "@/assets/cascio-7138-unified.jpg.asset.json";
import cascio7147 from "@/assets/cascio-7147-unified.jpg.asset.json";

export const studio = {
  name: "Titans Tattoo Studio",
  phoneDisplay: "(51) 99178-6170",
  whatsapp: "5551991786170",
  email: "contato@titanstattoostudio.com.br",
  address: "Rua Mathias Velho, 170 — Sala 201, Centro, Canoas/RS",
  cep: "CEP 92310-300",
  since: 2011,
  instagram: "@titanstattoostudio",
  facebook: "titans tattoo",
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
  photo: string;
  specialties: string[];
  works: { src: string; alt: string }[];
};

export const artists: Artist[] = [
  {
    slug: "cascio",
    name: "Cascio",
    role: "Realismo, preto e cinza e coberturas",
    bio: "Tatuador residente do Titans Tattoo Studio. Realismo e preto e cinza, com coberturas e trabalhos coloridos.",
    photo: cascioPhoto.url,
    specialties: ["Realismo", "Preto e cinza", "Cobertura", "Colorido"],
    works: [
      { src: cascio6108.url, alt: "Big Ben em preto e cinza tatuado por Cascio" },
      { src: cascio6155.url, alt: "Tower Bridge em preto e cinza tatuada por Cascio" },
      { src: cascio6197.url, alt: "Pezinho de bebê em realismo tatuado por Cascio" },
      { src: cascio6460.url, alt: "Nossa Senhora com flores coloridas tatuada por Cascio" },
      { src: cascio6509.url, alt: "Pezinho de bebê com nome em preto e cinza tatuado por Cascio" },
      { src: cascio6535.url, alt: "Águia realista em preto e cinza tatuada por Cascio" },
      { src: cascio7138.url, alt: "Rosa colorida na mão tatuada por Cascio" },
      { src: cascio6077.url, alt: "Rapunzel colorida tatuada por Cascio" },
      { src: cascio7147.url, alt: "Anjo em preto e cinza tatuado por Cascio" },
    ],
  },
  {
    slug: "ricardo",
    name: "Ricardo",
    role: "Blackwork, fine line, geek e colorido",
    bio: "Tatuador residente do Titans Tattoo Studio. Blackwork, fine line, temas geek e trabalhos coloridos.",
    photo: ricardoPhoto.url,
    specialties: ["Blackwork", "Fine line", "Geek", "Colorido"],
    works: [
      { src: ricardoPhoto.url, alt: "Ricardo — blackwork e fine line" },
    ],
  },
  {
    slug: "braian",
    name: "Braian",
    role: "Preto e cinza, blackwork e fine line",
    bio: "Tatuador residente do Titans Tattoo Studio. Preto e cinza, blackwork, fine line e trabalhos coloridos.",
    photo: braianPhoto.url,
    specialties: ["Preto e cinza", "Blackwork", "Fine line", "Colorido"],
    works: [
      { src: braianPhoto.url, alt: "Braian — preto e cinza e blackwork" },
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
  { id: "cascio-6108", src: cascio6108.url, alt: "Big Ben em preto e cinza tatuado por Cascio", style: "Realismo", artist: "Cascio" },
  { id: "cascio-6155", src: cascio6155.url, alt: "Tower Bridge em preto e cinza tatuada por Cascio", style: "Realismo", artist: "Cascio" },
  { id: "cascio-6197", src: cascio6197.url, alt: "Pezinho de bebê em realismo tatuado por Cascio", style: "Fine line", artist: "Cascio" },
  { id: "cascio-6460", src: cascio6460.url, alt: "Nossa Senhora com flores coloridas tatuada por Cascio", style: "Colorido", artist: "Cascio" },
  { id: "cascio-6509", src: cascio6509.url, alt: "Pezinho de bebê com nome em preto e cinza tatuado por Cascio", style: "Realismo", artist: "Cascio" },
  { id: "cascio-6535", src: cascio6535.url, alt: "Águia realista em preto e cinza tatuada por Cascio", style: "Realismo", artist: "Cascio" },
  { id: "cascio-7138", src: cascio7138.url, alt: "Rosa colorida na mão tatuada por Cascio", style: "Colorido", artist: "Cascio" },
  { id: "cascio-6077", src: cascio6077.url, alt: "Rapunzel colorida tatuada por Cascio", style: "Colorido", artist: "Cascio" },
  { id: "cascio-7147", src: cascio7147.url, alt: "Anjo em preto e cinza tatuado por Cascio", style: "Realismo", artist: "Cascio" },
  { id: "braian-1", src: braianPhoto.url, alt: "Braian — blackwork", style: "Blackwork", artist: "Braian" },
  { id: "ricardo-1", src: ricardoPhoto.url, alt: "Ricardo — fine line", style: "Fine line", artist: "Ricardo" },
  { id: "braian-2", src: braianPhoto.url, alt: "Braian — preto e cinza", style: "Preto e cinza", artist: "Braian" },
  { id: "ricardo-2", src: ricardoPhoto.url, alt: "Ricardo — geek e colorido", style: "Geek", artist: "Ricardo" },
];

export const testimonials = [
  {
    name: "Marina L.",
    text: "Fiz minha primeira tattoo com o Braian e fui tratada com uma paciência absurda. O traço ficou perfeito e a cicatrização foi tranquila.",
    service: "Fine line",
  },
  {
    name: "Bruno A.",
    text: "Cobri uma tatuagem de 15 anos atrás com o Cascio. O estúdio é impecável e o resultado passou muito do que eu esperava.",
    service: "Cobertura",
  },
  {
    name: "Carla S.",
    text: "Três sessões com o Cascio para fechar o braço. Organização, horário respeitado e um realismo de outro nível.",
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
