import cascioPhoto from "@/assets/artist-cascio.jpg.asset.json";
import ricardoPhoto from "@/assets/artist-ricardo.jpg.asset.json";
import braianPhoto from "@/assets/artist-braian-2026.jpg.asset.json";
import remocaoLaserPhoto from "@/assets/servico-remocao-laser.jpg.asset.json";
import piercingPhoto from "@/assets/servico-piercing.jpg.asset.json";
import tattooPhoto from "@/assets/servico-tattoo.jpg.asset.json";
import coberturaPhoto from "@/assets/servico-cobertura.jpg.asset.json";
import braian5722 from "@/assets/braian-IMG_5722.jpg.asset.json";
import braian6634 from "@/assets/braian-IMG_6634.jpg.asset.json";
import braian8589 from "@/assets/braian-IMG_8589.jpg.asset.json";
import braian8692 from "@/assets/braian-IMG_8692.webp.asset.json";
import braian8700 from "@/assets/braian-IMG_8700.jpg.asset.json";
import braian9404 from "@/assets/braian-IMG_9404.jpg.asset.json";
import braian9614 from "@/assets/braian-IMG_9614.jpg.asset.json";
import braianSnapseed from "@/assets/braian-Snapseed.jpg.asset.json";
import braian1543 from "@/assets/braian-IMG_1543.jpg.asset.json";

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
  image?: string;
};

export const services: Service[] = [
  {
    slug: "tattoo",
    name: "Tattoo",
    short: "Projetos autorais em preto e cinza, realismo, fine line e blackwork.",
    description:
      "Do primeiro rascunho à sessão final. Desenvolvemos o projeto junto com você, ajustamos tamanho e posicionamento no corpo e executamos com material descartável e equipamento profissional.",
    points: ["Projeto autoral", "Sessões de 1h a 8h", "Orçamento sem compromisso"],
    image: tattooPhoto.url,
  },
  {
    slug: "cobertura",
    name: "Cobertura e conserto",
    short: "Transformamos tatuagens antigas ou malfeitas em um trabalho novo.",
    description:
      "Avaliamos a pele, a densidade do pigmento antigo e propomos o caminho certo: cobertura completa, reforço ou clareamento prévio a laser antes de cobrir.",
    points: ["Avaliação presencial", "Plano em etapas", "Clareamento quando necessário"],
    image: coberturaPhoto.url,
  },
  {
    slug: "remocao-laser",
    name: "Remoção a laser",
    short: "Clareamento e remoção com laser Nd:YAG em sessões espaçadas.",
    description:
      "Protocolo com número de sessões estimado na avaliação, cuidados pós-sessão e acompanhamento fotográfico da evolução.",
    points: ["Avaliação da pele", "Sessões a cada 45 dias", "Registro antes e depois"],
    image: remocaoLaserPhoto.url,
  },
  {
    slug: "piercing",
    name: "Piercing",
    short: "Aplicação com material esterilizado e joias em titânio.",
    description:
      "Perfurações de orelha, corpo e face com técnica asséptica, joias de titânio ASTM F-136 e orientação completa de cicatrização.",
    points: ["Titânio implant grade", "Sala esterilizada", "Acompanhamento da troca"],
    image: piercingPhoto.url,
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
      { src: cascioPhoto.url, alt: "Retrato do tatuador Cascio" },
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
      { src: braian5722.url, alt: "Tatuagem realista de cachorro no braço por Braian" },
      { src: braian6634.url, alt: "Retrato realista de cachorro no antebraço por Braian" },
      { src: braian8589.url, alt: "Tatuagem colorida de dragão por Braian" },
      { src: braian8692.url, alt: "Tatuagem colorida do Homem de Ferro por Braian" },
      { src: braian8700.url, alt: "Tatuagem colorida de cachorro com girassóis por Braian" },
      { src: braian9404.url, alt: "Tatuagem colorida de ampulheta por Braian" },
      { src: braian9614.url, alt: "Fechamento de perna em preto e cinza por Braian" },
      { src: braianSnapseed.url, alt: "Tatuagem colorida do Homem-Aranha por Braian" },
      { src: braian1543.url, alt: "Tatuagem fine line de dragão por Braian" },
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
  { id: "cascio", src: cascioPhoto.url, alt: "Retrato do tatuador Cascio", style: "Realismo", artist: "Cascio" },
  { id: "ricardo", src: ricardoPhoto.url, alt: "Retrato do tatuador Ricardo", style: "Blackwork", artist: "Ricardo" },
  { id: "braian-5722", src: braian5722.url, alt: "Tatuagem realista de cachorro no braço", style: "Realismo", artist: "Braian" },
  { id: "braian-6634", src: braian6634.url, alt: "Retrato realista de cachorro no antebraço", style: "Realismo", artist: "Braian" },
  { id: "braian-8589", src: braian8589.url, alt: "Tatuagem colorida de dragão", style: "Colorido", artist: "Braian" },
  { id: "braian-8692", src: braian8692.url, alt: "Tatuagem colorida do Homem de Ferro", style: "Geek", artist: "Braian" },
  { id: "braian-8700", src: braian8700.url, alt: "Tatuagem realista colorida de cachorro com girassóis", style: "Colorido", artist: "Braian" },
  { id: "braian-9404", src: braian9404.url, alt: "Tatuagem colorida de ampulheta", style: "Colorido", artist: "Braian" },
  { id: "braian-9614", src: braian9614.url, alt: "Fechamento de perna em preto e cinza", style: "Preto e cinza", artist: "Braian" },
  { id: "braian-snapseed", src: braianSnapseed.url, alt: "Tatuagem colorida do Homem-Aranha", style: "Geek", artist: "Braian" },
  { id: "braian-1543", src: braian1543.url, alt: "Tatuagem fine line de dragão", style: "Fine line", artist: "Braian" },
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
