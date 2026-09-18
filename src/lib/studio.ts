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
import braian1663 from "@/assets/braian-IMG_1663.jpg.asset.json";
import braian1683 from "@/assets/braian-IMG_1683.jpg.asset.json";
import braian2845 from "@/assets/braian-IMG_2845.jpg.asset.json";
import braian4217 from "@/assets/braian-IMG_4217.jpg.asset.json";
import braian4482 from "@/assets/braian-IMG_4482.jpg.asset.json";
import braian5099 from "@/assets/braian-IMG_5099.jpg.asset.json";
import braian0708 from "@/assets/braian-IMG_0708.jpg.asset.json";
import braian1468 from "@/assets/braian-IMG_1468.jpg.asset.json";
import cascioRapunzel from "@/assets/cascio-2EEE1F99-940C-4570-81EE-1DB6BFB536ED.jpeg.asset.json";
import cascioTowerBridge from "@/assets/cascio-2EF96065-F072-4D31-8331-359F522E146A.png.asset.json";
import cascioArcanjo from "@/assets/cascio-7D3D1EAB-7493-4B5C-8518-E13AFA5A88F4.png.asset.json";
import cascioCinema from "@/assets/cascio-8C822F78-4C83-469D-ABB5-2122F567FB40.png.asset.json";
import cascioAnime from "@/assets/cascio-31B5B765-BAFD-4A69-88EF-35BD677AF498.png.asset.json";
import cascioAstronauta from "@/assets/cascio-33FC6431-FC88-4B07-9FE9-F623A3B6CE44.png.asset.json";
import cascioLeoes from "@/assets/cascio-44A9254C-2349-4447-BD2E-E0CEB6797ADD.png.asset.json";
import cascioTartaruga from "@/assets/cascio-46F69B4F-A843-480A-980B-D096E27E4858.webp.asset.json";
import cascioBorboleta from "@/assets/cascio-66FBD93E-77C0-42C9-9EA9-5112C7A44887.jpeg.asset.json";
import cascioGoku from "@/assets/cascio-69E1D0E1-BEAF-45EE-ACF6-041FF3C81CD9.webp.asset.json";
import cascioAnjo from "@/assets/cascio-83CAF6D0-F62B-46F6-A3CB-6BA4C2CEDC21.png.asset.json";
import cascioNossaSenhora from "@/assets/cascio-778CE0E0-9D29-49B8-82D8-A9F768F5AC29.webp.asset.json";
import cascioNoivaCadaver from "@/assets/cascio-907EAC4C-B4D7-4197-91DE-E6302E5BBD9C.webp.asset.json";
import cascioJesus from "@/assets/cascio-8324BD64-45EF-46AD-AC5F-FCBA7A41FBE4.png.asset.json";
import cascioAguiaRato from "@/assets/cascio-8579B645-9917-481C-9B01-3A49C60B8813.png.asset.json";
import cascioCoruja from "@/assets/cascio-A07BF075-38B8-40BC-967D-C2D88D56646E.webp.asset.json";
import cascioLobo from "@/assets/cascio-AF044896-CA8F-402D-8EB1-D4BD0D517449.webp.asset.json";
import cascioBalanco from "@/assets/cascio-B1BC4F42-CBAB-44B8-89F4-AA6E9B08B51D.png.asset.json";
import cascioRosa from "@/assets/cascio-BF29A457-ACAB-4DE9-8274-EDE063E2996C.png.asset.json";
import cascioGato from "@/assets/cascio-BBAF15AF-72C2-4306-B71F-A417577D954D.png.asset.json";
import cascioBigBen from "@/assets/cascio-C60ABD05-734A-4944-9742-2FA7FB42D18D.png.asset.json";
import cascioAguia from "@/assets/cascio-D476582A-0E20-42F0-AF92-87DA5210A7D0.png.asset.json";
import cascioOrquideas from "@/assets/cascio-DD9C8D6E-66BF-4A56-8D96-0A09068A1957.png.asset.json";
import cascioMulher from "@/assets/cascio-F5F0F516-00C9-4FB7-B56F-F7C679395AF2.png.asset.json";
import cascioMerida from "@/assets/cascio-IMG_5402.jpeg.asset.json";

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
    role: "Realismo, preto e cinza, colorido e coberturas",
    bio: "Tatuador residente do Titans Tattoo Studio com trabalhos em realismo e micro-realismo, preto e cinza, colorido, fine line, anime e geek, aquarela e new school, além de projetos de cobertura.",
    photo: cascioPhoto.url,
    specialties: ["Realismo", "Micro-realismo", "Preto e cinza", "Colorido", "Fine line", "Anime", "Geek", "Aquarela", "New school", "Cobertura"],
    works: [
      { src: cascioRapunzel.url, alt: "Tatuagem colorida da Rapunzel por Cascio" },
      { src: cascioTowerBridge.url, alt: "Tatuagem realista da Tower Bridge por Cascio" },
      { src: cascioArcanjo.url, alt: "Tatuagem realista de arcanjo por Cascio" },
      { src: cascioCinema.url, alt: "Tatuagem em aquarela com tema de cinema por Cascio" },
      { src: cascioAnime.url, alt: "Tatuagem anime colorida por Cascio" },
      { src: cascioAstronauta.url, alt: "Tatuagem em aquarela de astronauta por Cascio" },
      { src: cascioLeoes.url, alt: "Tatuagem realista de leões por Cascio" },
      { src: cascioTartaruga.url, alt: "Tatuagem micro-realista de tartaruga por Cascio" },
      { src: cascioBorboleta.url, alt: "Tatuagem fine line de borboleta por Cascio" },
      { src: cascioGoku.url, alt: "Tatuagem anime colorida do Goku por Cascio" },
      { src: cascioAnjo.url, alt: "Tatuagem realista de anjo por Cascio" },
      { src: cascioNossaSenhora.url, alt: "Tatuagem fine line colorida de Nossa Senhora por Cascio" },
      { src: cascioNoivaCadaver.url, alt: "Tatuagem colorida da Noiva Cadáver por Cascio" },
      { src: cascioJesus.url, alt: "Tatuagem realista de Jesus por Cascio" },
      { src: cascioAguiaRato.url, alt: "Tatuagem new school colorida de águia e rato por Cascio" },
      { src: cascioCoruja.url, alt: "Tatuagem colorida de coruja por Cascio" },
      { src: cascioLobo.url, alt: "Tatuagem realista de lobo por Cascio" },
      { src: cascioBalanco.url, alt: "Tatuagem em aquarela de criança no balanço por Cascio" },
      { src: cascioRosa.url, alt: "Tatuagem ornamental de rosa por Cascio" },
      { src: cascioGato.url, alt: "Tatuagem realista de gato com flores por Cascio" },
      { src: cascioBigBen.url, alt: "Tatuagem realista do Big Ben por Cascio" },
      { src: cascioAguia.url, alt: "Tatuagem realista de águia por Cascio" },
      { src: cascioOrquideas.url, alt: "Tatuagem realista colorida de orquídeas por Cascio" },
      { src: cascioMulher.url, alt: "Tatuagem realista de mulher por Cascio" },
      { src: cascioMerida.url, alt: "Tatuagem colorida da Merida por Cascio" },
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
    role: "Colorido, geek, anime, realismo e fine line",
    bio: "Tatuador residente do Titans Tattoo Studio com trabalhos que transitam entre o colorido vibrante, geek e anime, realismo e micro-realismo, fine line, preto e cinza, blackwork, aquarela e new school.",
    photo: braianPhoto.url,
    specialties: ["Colorido", "Geek", "Anime", "Realismo", "Micro-realismo", "Fine line", "Preto e cinza", "Blackwork", "Aquarela", "New school"],
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
      { src: braian1663.url, alt: "Tatuagem new school colorida por Braian" },
      { src: braian1683.url, alt: "Tatuagem anime colorida da Nezuko por Braian" },
      { src: braian2845.url, alt: "Tatuagem geek colorida do Mario por Braian" },
      { src: braian4217.url, alt: "Tatuagem micro-realista de tubarão por Braian" },
      { src: braian4482.url, alt: "Tatuagem colorida de cachorro por Braian" },
      { src: braian5099.url, alt: "Tatuagem em aquarela de abelha e flores por Braian" },
      { src: braian0708.url, alt: "Tatuagem anime colorida do Goku por Braian" },
      { src: braian1468.url, alt: "Tatuagem anime colorida de dragão por Braian" },
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
  { id: "cascio-rapunzel", src: cascioRapunzel.url, alt: "Tatuagem colorida da Rapunzel", style: "Geek", artist: "Cascio" },
  { id: "cascio-tower-bridge", src: cascioTowerBridge.url, alt: "Tatuagem realista da Tower Bridge", style: "Realismo", artist: "Cascio" },
  { id: "cascio-arcanjo", src: cascioArcanjo.url, alt: "Tatuagem realista de arcanjo", style: "Preto e cinza", artist: "Cascio" },
  { id: "cascio-cinema", src: cascioCinema.url, alt: "Tatuagem em aquarela com tema de cinema", style: "Aquarela", artist: "Cascio" },
  { id: "cascio-anime", src: cascioAnime.url, alt: "Tatuagem anime colorida", style: "Anime", artist: "Cascio" },
  { id: "cascio-astronauta", src: cascioAstronauta.url, alt: "Tatuagem em aquarela de astronauta", style: "Aquarela", artist: "Cascio" },
  { id: "cascio-leoes", src: cascioLeoes.url, alt: "Tatuagem realista de leões", style: "Realismo", artist: "Cascio" },
  { id: "cascio-tartaruga", src: cascioTartaruga.url, alt: "Tatuagem micro-realista de tartaruga", style: "Micro-realismo", artist: "Cascio" },
  { id: "cascio-borboleta", src: cascioBorboleta.url, alt: "Tatuagem fine line de borboleta", style: "Fine line", artist: "Cascio" },
  { id: "cascio-goku", src: cascioGoku.url, alt: "Tatuagem anime colorida do Goku", style: "Anime", artist: "Cascio" },
  { id: "cascio-anjo", src: cascioAnjo.url, alt: "Tatuagem realista de anjo", style: "Preto e cinza", artist: "Cascio" },
  { id: "cascio-nossa-senhora", src: cascioNossaSenhora.url, alt: "Tatuagem fine line colorida de Nossa Senhora", style: "Fine line", artist: "Cascio" },
  { id: "cascio-noiva-cadaver", src: cascioNoivaCadaver.url, alt: "Tatuagem colorida da Noiva Cadáver", style: "Geek", artist: "Cascio" },
  { id: "cascio-jesus", src: cascioJesus.url, alt: "Tatuagem realista de Jesus", style: "Realismo", artist: "Cascio" },
  { id: "cascio-aguia-rato", src: cascioAguiaRato.url, alt: "Tatuagem new school colorida de águia e rato", style: "New school", artist: "Cascio" },
  { id: "cascio-coruja", src: cascioCoruja.url, alt: "Tatuagem colorida de coruja", style: "Colorido", artist: "Cascio" },
  { id: "cascio-lobo", src: cascioLobo.url, alt: "Tatuagem realista de lobo", style: "Realismo", artist: "Cascio" },
  { id: "cascio-balanco", src: cascioBalanco.url, alt: "Tatuagem em aquarela de criança no balanço", style: "Aquarela", artist: "Cascio" },
  { id: "cascio-rosa", src: cascioRosa.url, alt: "Tatuagem ornamental de rosa", style: "Fine line", artist: "Cascio" },
  { id: "cascio-gato", src: cascioGato.url, alt: "Tatuagem realista de gato com flores", style: "Realismo", artist: "Cascio" },
  { id: "cascio-big-ben", src: cascioBigBen.url, alt: "Tatuagem realista do Big Ben", style: "Preto e cinza", artist: "Cascio" },
  { id: "cascio-aguia", src: cascioAguia.url, alt: "Tatuagem realista de águia", style: "Realismo", artist: "Cascio" },
  { id: "cascio-orquideas", src: cascioOrquideas.url, alt: "Tatuagem realista colorida de orquídeas", style: "Colorido", artist: "Cascio" },
  { id: "cascio-mulher", src: cascioMulher.url, alt: "Tatuagem realista de mulher", style: "Preto e cinza", artist: "Cascio" },
  { id: "cascio-merida", src: cascioMerida.url, alt: "Tatuagem colorida da Merida", style: "Geek", artist: "Cascio" },
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
  { id: "braian-1663", src: braian1663.url, alt: "Tatuagem new school colorida", style: "New school", artist: "Braian" },
  { id: "braian-1683", src: braian1683.url, alt: "Tatuagem anime colorida da Nezuko", style: "Anime", artist: "Braian" },
  { id: "braian-2845", src: braian2845.url, alt: "Tatuagem geek colorida do Mario", style: "Geek", artist: "Braian" },
  { id: "braian-4217", src: braian4217.url, alt: "Tatuagem micro-realista de tubarão", style: "Micro-realismo", artist: "Braian" },
  { id: "braian-4482", src: braian4482.url, alt: "Tatuagem colorida de cachorro", style: "Colorido", artist: "Braian" },
  { id: "braian-5099", src: braian5099.url, alt: "Tatuagem em aquarela de abelha e flores", style: "Aquarela", artist: "Braian" },
  { id: "braian-0708", src: braian0708.url, alt: "Tatuagem anime colorida do Goku", style: "Anime", artist: "Braian" },
  { id: "braian-1468", src: braian1468.url, alt: "Tatuagem anime colorida de dragão", style: "Anime", artist: "Braian" },
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
