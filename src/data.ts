import { Screen, WidgetType } from "./types";

export const PRESET_IMAGES = [
  { name: "Painel de Promoção de Hambúrguer", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80" },
  { name: "Cafeteria Especial", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80" },
  { name: "Suco de Laranja Natural", url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1200&q=80" },
  { name: "Aviso de Reunião Corporativa", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80" },
  { name: "Academia e Saúde", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80" }
];

export const PRESET_VIDEOS = [
  { name: "Cachoeira Relaxante (Natureza)", url: "https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4" },
  { name: "Café Sendo Servido (Estética)", url: "https://assets.mixkit.co/videos/preview/mixkit-coffee-pouring-into-a-cup-32863-large.mp4" },
  { name: "Tecnologia e Rede (Cyberpunk)", url: "https://assets.mixkit.co/videos/preview/mixkit-abstract-glowing-particles-background-loop-41584-large.mp4" },
  { name: "Lareira Aconchegante (Inverno)", url: "https://assets.mixkit.co/videos/preview/mixkit-fire-burning-in-a-fireplace-close-up-40176-large.mp4" }
];

export const DEFAULT_SCREENS: Screen[] = [
  {
    id: "regional",
    name: "regional",
    description: "Tela principal para recepção - Teixeira de Freitas",
    orientation: "horizontal",
    splitScreen: true,
    showNewsTicker: true,
    updatedAt: new Date().toISOString(),
    status: "offline",
    items: [
      {
        id: "widget-1",
        type: WidgetType.VERSE,
        title: "Versículo do dia",
        duration: 10,
        active: true,
        config: {
          bibleTopic: "Paz",
          textColor: "#ffffff",
          bgColor: "#1e1b4b" // Indigo escuro
        }
      },
      {
        id: "widget-2",
        type: WidgetType.WEATHER,
        title: "Clima - teixeira de freitas",
        duration: 10,
        active: true,
        config: {
          city: "Teixeira de Freitas"
        }
      },
      {
        id: "widget-3",
        type: WidgetType.NEWS,
        title: "Notícias - geral",
        duration: 10,
        active: true,
        config: {
          newsCategory: "geral"
        }
      },
      {
        id: "widget-4",
        type: WidgetType.VIDEO,
        title: "Vídeo por link",
        duration: 15,
        active: true,
        config: {
          url: "https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4"
        }
      },
      {
        id: "widget-5",
        type: WidgetType.QRCODE,
        title: "Nosso cardápio digital",
        duration: 10,
        active: true,
        config: {
          qrUrl: "https://vtxmedia.com/cardapio",
          qrTitle: "Cardápio Digital",
          qrDesc: "Aponte a câmera para ver nossos pratos especiais e promoções do dia!"
        }
      },
      {
        id: "widget-6",
        type: WidgetType.TRIVIA,
        title: "Curiosidades incríveis",
        duration: 10,
        active: true,
        config: {
          triviaTopic: "Ciência",
          textColor: "#ffffff",
          bgColor: "#124e3f" // Verde petróleo
        }
      }
    ]
  }
];

export const BIBLE_PRESENTS = [
  { title: "Esperança", content: "Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.", extra: "Jeremias 29:11" },
  { title: "Força", content: "Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.", extra: "Josué 1:9" },
  { title: "Paz", content: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.", extra: "João 14:27" },
  { title: "Fé", content: "Ora, a fé é a certeza de coisas que se esperam, a convicção de fatos que se não veem.", extra: "Hebreus 11:1" },
  { title: "Amor", content: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Não maltrata, não procura seus interesses.", extra: "1 Coríntios 13:4-5" }
];

export const TRIVIA_PRESENTS = [
  { title: "Espaço", content: "Um dia em Vênus é mais longo do que um ano inteiro em Vênus. O planeta leva mais tempo para girar em torno do seu próprio eixo do que para completar uma órbita.", extra: "Sistema Solar" },
  { title: "Ciência", content: "A água pode congelar e ferver ao mesmo tempo. Isso é conhecido como o 'ponto triplo' e ocorre quando a temperatura e a pressão são perfeitas.", extra: "Física" },
  { title: "Animais", content: "As lontras marinhas dão as mãos enquanto dormem para evitar flutuar e se separar umas das outras na correnteza do oceano.", extra: "Biologia" },
  { title: "História", content: "O monumento romano Coliseu de Roma já foi inundado propositalmente para realizar batalhas navais reais encenadas para o público.", extra: "Antiguidade" },
  { title: "Natureza", content: "Existem mais árvores na Terra do que estrelas na Via Láctea. Estima-se 3 trilhões de árvores na Terra contra 100 a 400 bilhões de estrelas.", extra: "Planeta Terra" }
];

export const ANNOUNCEMENT_PRESENTS = [
  { title: "Café Fresco", content: "Atenção equipe! Um lote de café fresco e especial acaba de ser preparado na copa. Venha recarregar suas energias!", extra: "Comunidade" },
  { title: "Ideia Sustentável", content: "Substitua copos descartáveis por canecas térmicas reutilizáveis. Pequenos gestos corporativos fazem grande diferença para o planeta.", extra: "Eco Nex" },
  { title: "Aniversariantes do Mês", content: "Desejamos parabéns e muito sucesso a todos os nossos colegas de equipe que celebram aniversário este mês!", extra: "Recursos Humanos" }
];
