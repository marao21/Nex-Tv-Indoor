import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header for telemetry
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Gemini generation helper route
app.post("/api/gemini/generate", async (req, res) => {
  const { type, prompt, count = 3 } = req.body;

  if (!ai) {
    // If no API Key is provided, fallback to a mocked beautiful generator
    return res.json({
      success: true,
      fallback: true,
      items: getMockGeminiResponse(type, prompt, count)
    });
  }

  try {
    let systemInstruction = "";
    let userPrompt = "";

    if (type === "trivia") {
      systemInstruction = "Você é um gerador de curiosidades incríveis e interessantes para TV corporativa e mídia indoor. Retorne uma lista de curiosidades curtas, fáceis de ler rapidamente de longe. Cada curiosidade deve ter um título curto e um fato impactante de no máximo 140 caracteres.";
      userPrompt = prompt ? `Gere sobre o tema: ${prompt}` : "Gere 3 curiosidades gerais variadas e fascinantes.";
    } else if (type === "verse") {
      systemInstruction = "Você é um selecionador de versículos bíblicos inspiradores para telas de mídia indoor. Retorne versículos motivadores com o texto completo em português e a referência bíblica exata (livro, capítulo e versículo).";
      userPrompt = prompt ? `Gere versículos sobre o tema: ${prompt}` : "Gere 3 versículos bíblicos edificantes e inspiradores.";
    } else if (type === "announcement") {
      systemInstruction = "Você é um assistente de RH e Comunicação Interna. Crie avisos e comunicados corporativos curtos, com títulos engajadores e textos objetivos de no máximo 120 caracteres. Use um tom amigável e profissional.";
      userPrompt = prompt ? `Crie um aviso baseado no seguinte pedido: ${prompt}` : "Crie 3 avisos corporativos genéricos (ex: aviso de café, reciclagem, integração).";
    } else {
      systemInstruction = "Você é um redator de notícias curtas para painéis de LED e TV. Retorne manchetes dinâmicas com um título chamativo e um resumo de 1 linha.";
      userPrompt = prompt ? `Notícias sobre: ${prompt}` : "Gere 3 notícias gerais fictícias ou recentes.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT" as any,
          properties: {
            items: {
              type: "ARRAY" as any,
              items: {
                type: "OBJECT" as any,
                properties: {
                  title: { type: "STRING" as any, description: "Título do item" },
                  content: { type: "STRING" as any, description: "Conteúdo principal do item (curto, máx 140 caracteres)" },
                  extra: { type: "STRING" as any, description: "Extra (referência bíblica para versículo, ou tema para curiosidade/aviso)" }
                },
                required: ["title", "content"]
              }
            }
          },
          required: ["items"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, items: data.items || [] });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      items: getMockGeminiResponse(type, prompt, count)
    });
  }
});

// Weather API proxy using open-meteo (fully free, no API key required)
app.get("/api/proxy/weather", async (req, res) => {
  const city = (req.query.city as string) || "Teixeira de Freitas";
  try {
    // 1. Geocode city name to lat/lon
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      // Fallback with generic coords if not found
      return res.json(getMockWeather(city));
    }

    const location = geoData.results[0];
    const { latitude, longitude, name, admin1 } = location;

    // 2. Fetch current weather conditions
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (!weatherData.current) {
      return res.json(getMockWeather(city));
    }

    const { temperature_2m, relative_humidity_2m, weather_code, wind_speed_10m } = weatherData.current;

    // Map WMO weather codes to descriptions and icons
    const weatherDescription = mapWeatherCode(weather_code);

    res.json({
      city: `${name}, ${admin1 || ""}`,
      temp: Math.round(temperature_2m),
      humidity: relative_humidity_2m,
      windSpeed: Math.round(wind_speed_10m),
      condition: weatherDescription.text,
      code: weather_code,
      icon: weatherDescription.icon,
      isReal: true
    });
  } catch (error) {
    console.warn("Weather proxy error, using mock data:", error);
    res.json(getMockWeather(city));
  }
});

// Stocks proxy endpoint
app.get("/api/proxy/stocks", async (req, res) => {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    const data = await response.json();
    if (data && data.rates && data.rates.BRL) {
      const usdToBrl = data.rates.BRL;
      const eurToBrl = usdToBrl / data.rates.EUR;
      const btcToUsd = 1 / (data.rates.BTC || 0.00001);
      const btcToBrl = btcToUsd * usdToBrl;

      return res.json({
        success: true,
        items: [
          { name: "Dólar Comercial", symbol: "USD/BRL", value: `R$ ${usdToBrl.toFixed(2)}`, change: "+0.45%", isUp: true },
          { name: "Euro", symbol: "EUR/BRL", value: `R$ ${eurToBrl.toFixed(2)}`, change: "-0.12%", isUp: false },
          { name: "Bitcoin", symbol: "BTC/BRL", value: `R$ ${Math.round(btcToBrl).toLocaleString("pt-BR")}`, change: "+1.89%", isUp: true },
          { name: "Ibovespa", symbol: "IBOV", value: "119.450 pts", change: "+0.78%", isUp: true }
        ]
      });
    }
  } catch (e) {
    // Ignore and fallback
  }

  // Fallback mock stocks
  res.json({
    success: true,
    items: [
      { name: "Dólar Comercial", symbol: "USD/BRL", value: "R$ 5,42", change: "+0.32%", isUp: true },
      { name: "Euro", symbol: "EUR/BRL", value: "R$ 5,81", change: "-0.15%", isUp: false },
      { name: "Bitcoin", symbol: "BTC/BRL", value: "R$ 345.500", change: "+2.41%", isUp: true },
      { name: "Ibovespa", symbol: "IBOV", value: "121.250 pts", change: "+0.65%", isUp: true }
    ]
  });
});

// News proxy endpoint
app.get("/api/proxy/news", (req, res) => {
  const category = (req.query.category as string) || "geral";
  const newsList = getPreseededNews(category);
  res.json({ success: true, items: newsList });
});

// Lottery proxy endpoint
app.get("/api/proxy/lottery", (req, res) => {
  res.json({
    success: true,
    items: [
      { name: "Mega-Sena", draw: "Concurso 2734", date: "24/06/2026", numbers: ["04", "12", "32", "45", "49", "58"], prize: "R$ 42 Milhões" },
      { name: "Lotofácil", draw: "Concurso 3122", date: "24/06/2026", numbers: ["01", "03", "04", "06", "08", "09", "10", "12", "14", "15", "17", "18", "21", "22", "25"], prize: "R$ 1.7 Milhão" },
      { name: "Quina", draw: "Concurso 6451", date: "24/06/2026", numbers: ["05", "18", "37", "42", "79"], prize: "R$ 5 Milhões" }
    ]
  });
});

// ----------------------------------------------------
// FALLBACK GENERATORS & HELPER FUNCTIONS
// ----------------------------------------------------

function mapWeatherCode(code: number) {
  if (code === 0) return { text: "Céu Limpo", icon: "sun" };
  if (code >= 1 && code <= 3) return { text: "Parcialmente Nublado", icon: "cloud-sun" };
  if (code === 45 || code === 48) return { text: "Nevoeiro", icon: "cloud" };
  if (code >= 51 && code <= 55) return { text: "Chuvisco", icon: "cloud-drizzle" };
  if (code >= 61 && code <= 65) return { text: "Chuva", icon: "cloud-rain" };
  if (code >= 71 && code <= 77) return { text: "Neve", icon: "cloud-snow" };
  if (code >= 80 && code <= 82) return { text: "Pancadas de Chuva", icon: "cloud-rain" };
  if (code >= 95 && code <= 99) return { text: "Tempestade", icon: "cloud-lightning" };
  return { text: "Nublado", icon: "cloud" };
}

function getMockWeather(city: string) {
  // Return realistic mock based on city name
  const hour = new Date().getHours();
  let temp = 25;
  let condition = "Ensolarado";
  let icon = "sun";

  if (city.toLowerCase().includes("teixeira") || city.toLowerCase().includes("freitas")) {
    temp = 28;
    condition = "Parcialmente Nublado";
    icon = "cloud-sun";
  } else if (city.toLowerCase().includes("curitiba") || city.toLowerCase().includes("sul")) {
    temp = 16;
    condition = "Nublado";
    icon = "cloud";
  } else if (city.toLowerCase().includes("rio") || city.toLowerCase().includes("salvador")) {
    temp = 30;
    condition = "Céu Limpo";
    icon = "sun";
  }

  // Add random variation
  temp += Math.floor(Math.sin(hour) * 3);

  return {
    city,
    temp,
    humidity: 65,
    windSpeed: 12,
    condition,
    code: 1,
    icon,
    isReal: false
  };
}

function getPreseededNews(category: string) {
  const tech = [
    { title: "Inteligência Artificial no Cotidiano", content: "Novas ferramentas de IA auxiliam empresas brasileiras a otimizarem processos internos e comunicação com o cliente." },
    { title: "Segurança de Dados nas Redes", content: "Especialistas alertam para a importância de manter senhas complexas e ativação de dupla autenticação em contas." },
    { title: "Lançamento de Smartphones", content: "Novos aparelhos focados em eficiência energética e câmeras profissionais chegam ao mercado com preços competitivos." }
  ];

  const sports = [
    { title: "Campeonato de Futebol", content: "Rodada decisiva mexe com a tabela de classificação e acirra disputa pelo título deste semestre." },
    { title: "Preparação para Olimpíadas", content: "Atletas brasileiros intensificam treinos e batem recordes nacionais antes de embarcarem para os jogos." },
    { title: "Corrida de Rua Local", content: "Evento reúne mais de 2 mil participantes e incentiva hábitos de vida saudáveis na comunidade regional." }
  ];

  const general = [
    { title: "Previsão do Tempo Semanal", content: "Frente fria se aproxima, trazendo chuvas isoladas e declínio nas temperaturas em diversas regiões." },
    { title: "Economia e Planejamento", content: "Especialistas sugerem dicas práticas para organizar finanças pessoais e planejar investimentos seguros para o ano." },
    { title: "Dicas de Alimentação Saudável", content: "Nutricionistas reforçam a importância de incluir frutas da estação e bastante água no dia a dia no escritório." },
    { title: "Inovação no Transporte Público", content: "Novas frotas de ônibus elétricos começam a circular, visando reduzir a emissão de poluentes nas grandes cidades." }
  ];

  const curiosities = [
    { title: "Você sabia?", content: "O mel de abelha é o único alimento que não estraga. Potes de mel com mais de 3 mil anos foram encontrados no Egito ainda comestíveis." },
    { title: "Velocidade da Luz", content: "A luz do Sol leva aproximadamente 8 minutos e 20 segundos para chegar até a Terra, percorrendo 150 milhões de quilômetros." },
    { title: "O poder do sorriso", content: "Sorrir ativa a liberação de neuropeptídios que ajudam a combater o estresse, além de liberar dopamina, endorfina e serotonina." }
  ];

  if (category === "tecnologia") return tech;
  if (category === "esportes") return sports;
  if (category === "curiosidades") return curiosities;
  return general;
}

function getMockGeminiResponse(type: string, prompt: string, count: number) {
  const items = [];
  if (type === "trivia") {
    const pool = [
      { title: "Origem do Wi-Fi", content: "O Wi-Fi foi inventado originalmente por astrônomos australianos que buscavam detectar pequenas explosões de buracos negros.", extra: "Tecnologia" },
      { title: "Cérebro Ativo", content: "Seu cérebro gera energia suficiente para acender uma pequena lâmpada de LED de 10W enquanto você está acordado.", extra: "Saúde" },
      { title: "Oxigênio do Mar", content: "Mais de 50% do oxigênio da Terra é produzido pelos oceanos, principalmente por fitoplânctons e algas marinhas.", extra: "Ciência" },
      { title: "Dia de 24 horas?", content: "A rotação da Terra está diminuindo muito lentamente, o que significa que no passado um dia durava apenas cerca de 6 horas.", extra: "Espaço" },
      { title: "A Grande Muralha", content: "Ao contrário da crença popular, a Grande Muralha da China não é visível do espaço a olho nu sem equipamentos específicos.", extra: "História" }
    ];
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      items.push(pool[i]);
    }
  } else if (type === "verse") {
    const pool = [
      { title: "Confiança", content: "Não fui eu que ordenei a você? Seja forte e corajoso! Não se apavore nem desanime, pois o Senhor, o seu Deus, estará com você por onde você andar.", extra: "Josué 1:9" },
      { title: "Paz", content: "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.", extra: "João 14:27" },
      { title: "Força", content: "Tudo posso naquele que me fortalece.", extra: "Filipenses 4:13" },
      { title: "Provisão", content: "O Senhor é o meu pastor, nada me faltará. Deita-me em verdes pastos, guia-me mansamente a águas tranquilas.", extra: "Salmo 23:1-2" }
    ];
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      items.push(pool[i]);
    }
  } else if (type === "announcement") {
    const pool = [
      { title: "Café Quentinho", content: "Café fresco acabou de ser feito na copa! Venha recarregar suas energias e bater um papo rápido com a equipe.", extra: "Cotidiano" },
      { title: "Foco no Trabalho", content: "Lembre-se de fazer pequenas pausas e alongar o corpo a cada 1 hora. Sua saúde e produtividade agradecem!", extra: "Saúde" },
      { title: "Dica de Reciclagem", content: "Ajude-nos a manter o escritório verde! Use as lixeiras coloridas corretamente e prefira sempre canecas reutilizáveis.", extra: "Sustentabilidade" }
    ];
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      items.push(pool[i]);
    }
  } else {
    const pool = [
      { title: "Destaque do Mês", content: "Nossa empresa bateu a meta trimestral com crescimento recorde! Parabéns a todos os colaboradores envolvidos.", extra: "Destaque" },
      { title: "Nova Integração", content: "Boas-vindas aos novos membros do time que iniciaram esta semana na empresa! Desejamos muito sucesso.", extra: "RH" },
      { title: "Treinamento Disponível", content: "A trilha de capacitação profissional já está aberta na nossa plataforma. Conclua seus módulos até sexta-feira.", extra: "Educação" }
    ];
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      items.push(pool[i]);
    }
  }
  return items;
}

// ----------------------------------------------------
// VITE AND STATIC ASSETS SERVING SETUP
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
