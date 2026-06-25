import React, { useState, useEffect, useRef } from "react";
import { Screen, WidgetItem, WidgetType } from "../types";
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Clock as ClockIcon,
  Newspaper,
  Calendar,
  AlertTriangle,
  QrCode,
  TrendingUp,
  TrendingDown,
  Gift,
  Tv,
  X,
  VolumeX,
  Volume2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BIBLE_PRESENTS, TRIVIA_PRESENTS, ANNOUNCEMENT_PRESENTS } from "../data";

interface TVPlayerProps {
  screen: Screen;
  onClose?: () => void;
  isEmbedPreview?: boolean; // If inside the admin editor, don't use full window height
}

export default function TVPlayer({ screen, onClose, isEmbedPreview = false }: TVPlayerProps) {
  const activeItems = screen.items.filter((item) => item.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [newsTickerItems, setNewsTickerItems] = useState<any[]>([]);
  const [stocksData, setStocksData] = useState<any[]>([]);
  const [lotteryData, setLotteryData] = useState<any[]>([]);
  const [videoMuted, setVideoMuted] = useState(true);

  const currentItem: WidgetItem | undefined = activeItems[currentIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cycle slideshow
  useEffect(() => {
    if (activeItems.length === 0) return;

    const duration = (currentItem?.duration || 10) * 1000;

    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeItems.length);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, activeItems.length, currentItem]);

  // Fetch split-screen external data
  useEffect(() => {
    if (!screen.splitScreen) return;

    // Fetch Weather
    const city = currentItem?.config?.city || screen.items.find(i => i.type === WidgetType.WEATHER)?.config?.city || "Teixeira de Freitas";
    fetch(`/api/proxy/weather?city=${encodeURIComponent(city)}`)
      .then((res) => res.json())
      .then((data) => setWeatherData(data))
      .catch(() => {});

    // Fetch News ticker
    fetch(`/api/proxy/news?category=geral`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNewsTickerItems(data.items);
      })
      .catch(() => {});

    // Fetch Stocks
    fetch(`/api/proxy/stocks`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStocksData(data.items);
      })
      .catch(() => {});

    // Fetch Lottery
    fetch(`/api/proxy/lottery`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLotteryData(data.items);
      })
      .catch(() => {});
  }, [screen.splitScreen, currentItem]);

  if (activeItems.length === 0) {
    return (
      <div className={`relative flex flex-col items-center justify-center bg-slate-950 text-white ${isEmbedPreview ? "h-[320px] rounded-lg" : "min-h-screen w-full"}`}>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full cursor-pointer z-50"
          >
            <X className="w-5 h-5 text-slate-300" />
          </button>
        )}
        <Tv className="w-16 h-16 text-slate-600 mb-4 animate-pulse" />
        <p className="text-xl font-medium text-slate-400">Nenhum widget ativo nesta tela</p>
        <p className="text-sm text-slate-500 mt-2">Ative ou adicione mídias no painel do administrador para iniciar o player.</p>
      </div>
    );
  }

  // Weather icon mapping
  const renderWeatherIcon = (iconName: string, className = "w-12 h-12") => {
    switch (iconName) {
      case "sun":
        return <Sun className={`${className} text-amber-500 animate-spin-slow`} />;
      case "cloud-sun":
        return <CloudSun className={`${className} text-amber-400`} />;
      case "cloud-rain":
        return <CloudRain className={`${className} text-sky-400`} />;
      case "cloud-snow":
        return <CloudSnow className={`${className} text-blue-200`} />;
      case "cloud-lightning":
        return <CloudLightning className={`${className} text-violet-400`} />;
      case "cloud-drizzle":
        return <CloudDrizzle className={`${className} text-sky-300`} />;
      default:
        return <Cloud className={`${className} text-slate-400`} />;
    }
  };

  const rotation = screen.tvRotation || "-90";
  const isVertical = screen.orientation === "vertical";

  let playerStyle: React.CSSProperties = {};
  if (!isEmbedPreview) {
    if (isVertical) {
      if (rotation === "-90") {
        playerStyle = {
          position: "fixed",
          top: "100%",
          left: "0",
          width: "100vh",
          height: "100vw",
          transform: "rotate(-90deg)",
          transformOrigin: "top left",
          overflow: "hidden",
          zIndex: 50,
        };
      } else if (rotation === "90") {
        playerStyle = {
          position: "fixed",
          top: "0",
          left: "100%",
          width: "100vh",
          height: "100vw",
          transform: "rotate(90deg)",
          transformOrigin: "top left",
          overflow: "hidden",
          zIndex: 50,
        };
      } else {
        playerStyle = {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 50,
        };
      }
    } else {
      playerStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 50,
      };
    }
  }

  return (
    <div
      style={playerStyle}
      className={`relative bg-slate-950 text-white overflow-hidden select-none font-sans flex flex-col justify-between ${
        isEmbedPreview 
          ? (screen.orientation === "vertical" ? "h-[500px] w-[281px] mx-auto rounded-lg border-4 border-slate-800 shadow-2xl" : "h-[450px] w-full rounded-lg border-4 border-slate-800 shadow-2xl") 
          : "fixed inset-0 w-screen h-screen z-50"
      }`}
    >
      {/* Player Close Overlay Button */}
      {onClose && !isEmbedPreview && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-3 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-full cursor-pointer z-50 shadow-lg border border-slate-700"
          title="Sair do Player"
        >
          <X className="w-6 h-6 text-slate-200" />
        </button>
      )}

      {/* Main Layout Container */}
      <div className={`flex-1 flex overflow-hidden w-full h-full ${screen.orientation === "vertical" ? "flex-col" : "flex-row"}`}>
        {/* Main Content Area */}
        <div className={`relative flex flex-col bg-slate-900 transition-all duration-500 ${
          screen.splitScreen 
            ? (screen.orientation === "vertical" ? "h-[62%] w-full" : "w-[72%] h-full") 
            : "w-full h-full"
        }`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 w-full h-full flex flex-col justify-center items-center"
            >
              <WidgetContentRenderer
                item={currentItem}
                renderWeatherIcon={renderWeatherIcon}
                videoMuted={videoMuted}
                setVideoMuted={setVideoMuted}
                weatherData={weatherData}
              />
            </motion.div>
          </AnimatePresence>

          {/* Indicator bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800 overflow-hidden">
            <motion.div
              key={currentItem.id}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: currentItem.duration, ease: "linear" }}
              className="h-full bg-amber-500 shadow-glow"
            />
          </div>
        </div>

        {/* Persistent Side Panel (Modo Split Screen) */}
        {screen.splitScreen && (
          <div className={`${
            screen.orientation === "vertical" 
              ? "w-full h-[38%] border-t border-l-0 p-4 flex-row" 
              : "w-[28%] h-full border-l p-5 flex-col"
          } bg-slate-950 border-slate-800 flex justify-between select-none overflow-hidden gap-3`}>
            
            {/* 1. Live Digital Clock */}
            <div className={`bg-slate-900/60 rounded-xl border border-slate-800 text-center relative overflow-hidden group flex flex-col justify-center ${
              screen.orientation === "vertical" ? "flex-1 h-full p-2" : "p-4"
            }`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
              <Clock />
            </div>

            {/* 2. Weather Sidebar Widget */}
            <div className={`bg-slate-900/60 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col justify-center ${
              screen.orientation === "vertical" ? "flex-1 h-full p-2" : "p-4"
            }`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />
              <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5 flex items-center gap-1.5 justify-center sm:justify-start">
                <Sun className="w-3.5 h-3.5 text-amber-500" /> Clima
              </h4>
              {weatherData ? (
                <div className={`flex items-center justify-between gap-1 ${screen.orientation === "vertical" ? "flex-col xs:flex-row text-center xs:text-left" : ""}`}>
                  <div>
                    <p className="text-sm font-bold text-slate-100 truncate max-w-[110px]">{weatherData.city.split(",")[0]}</p>
                    <p className="text-lg font-black text-amber-500 mt-0.5">{weatherData.temp}°C</p>
                  </div>
                  <div className="flex flex-col items-center">
                    {renderWeatherIcon(weatherData.icon, screen.orientation === "vertical" ? "w-8 h-8" : "w-14 h-14")}
                    <span className="text-[9px] text-slate-500 mt-0.5 hidden xs:inline">Umid: {weatherData.humidity}%</span>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse flex items-center justify-between h-14">
                  <div className="bg-slate-800 h-6 w-20 rounded" />
                  <div className="bg-slate-800 h-10 w-10 rounded-full" />
                </div>
              )}
            </div>

            {/* 3. Financial Quotes (Stocks) Sidebar Widget */}
            <div className={`bg-slate-900/60 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col justify-center ${
              screen.orientation === "vertical" ? "flex-1 h-full p-2" : "flex-1 my-3 p-4 justify-between"
            }`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5 flex items-center gap-1.5 justify-center sm:justify-start">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Cotações
              </h4>
              <div className={`grid gap-1.5 justify-center content-center ${screen.orientation === "vertical" ? "grid-cols-2" : "grid-cols-2 flex-1"}`}>
                {(stocksData.length > 0 ? stocksData : [
                  { symbol: "USD/BRL", value: "R$ 5,42", isUp: true, change: "+0.32%" },
                  { symbol: "EUR/BRL", value: "R$ 5,81", isUp: false, change: "-0.15%" },
                  { symbol: "BTC/BRL", value: "R$ 345k", isUp: true, change: "+2.41%" },
                  { symbol: "IBOV", value: "121k pts", isUp: true, change: "+0.65%" }
                ]).slice(0, screen.orientation === "vertical" ? 2 : 4).map((stock, i) => (
                  <div key={i} className="bg-slate-950/80 p-1.5 rounded border border-slate-800/80 flex flex-col justify-center text-center xs:text-left">
                    <p className="text-[9px] font-mono text-slate-400 font-bold">{stock.symbol}</p>
                    <p className="text-xs font-black text-slate-100">{stock.value}</p>
                    <span className={`text-[8px] font-bold flex items-center gap-0.5 mt-0.5 justify-center xs:justify-start ${stock.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                      {stock.isUp ? "▲" : "▼"} {stock.change}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Mini Lottery Results */}
            <div className={`bg-slate-900/60 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col justify-center ${
              screen.orientation === "vertical" ? "flex-1 h-full p-2" : "p-3"
            }`}>
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
              <h4 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1.5 flex items-center gap-1.5 justify-center sm:justify-start">
                🎰 Loterias
              </h4>
              {lotteryData.length > 0 ? (
                <div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-purple-400 truncate max-w-[60px]">{lotteryData[0].name}</span>
                    <span className="text-[8px] text-slate-500 hidden xs:inline">{lotteryData[0].draw}</span>
                  </div>
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                    {lotteryData[0].numbers.slice(0, screen.orientation === "vertical" ? 4 : 6).map((num: string, idx: number) => (
                      <span key={idx} className="w-4.5 h-4.5 flex items-center justify-center rounded-full bg-purple-950 text-purple-200 border border-purple-700/50 font-mono text-[9px] font-bold">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[9px] text-slate-500 text-center">Carregando...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Persistent Scrolling News Marquee on Bottom (Toda Tela / Modo Split) */}
      {screen.showNewsTicker !== false && (
        <div className="bg-slate-950 border-t border-slate-800 h-16 flex items-center overflow-hidden w-full relative">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          {/* Fixed Title Label */}
          <div className="bg-amber-500 text-slate-950 h-full px-5 flex items-center font-black tracking-wider uppercase text-xs sm:text-sm z-10 select-none shadow-lg shrink-0 gap-2">
            <Newspaper className="w-4 h-4 animate-pulse" /> NEWS TICKER
          </div>
          {/* Marquee Container */}
          <div className="flex-1 overflow-hidden relative flex items-center h-full">
            <div className="marquee-content flex gap-12 text-slate-200 font-bold tracking-wide whitespace-nowrap items-center text-sm">
              {newsTickerItems.length > 0 ? (
                newsTickerItems.concat(newsTickerItems).map((news, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-amber-500 font-black shrink-0 text-[10px] uppercase tracking-widest border border-amber-500/30 px-1.5 py-0.5 rounded">
                      GERAL
                    </span>
                    <span className="hover:text-amber-400 transition-colors">{news.title}:</span>
                    <span className="text-slate-400 font-normal">{news.content}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span>Buscando últimas notícias da região de Teixeira de Freitas e do Brasil...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// DIGITAL CLOCK COMPONENT
// ----------------------------------------------------
function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formattedDate = time.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        <Calendar className="w-4 h-4" />
        <span className="text-xs uppercase font-extrabold tracking-widest">Horário Local</span>
      </div>
      <p className="text-4xl font-black font-mono tracking-wider text-amber-500 select-none shadow-glow">
        {formattedTime}
      </p>
      <p className="text-[11px] text-slate-400 font-semibold uppercase mt-1">
        {formattedDate}
      </p>
    </div>
  );
}

// ----------------------------------------------------
// WIDGET CONTENT RENDERING ENGINE
// ----------------------------------------------------
function WidgetContentRenderer({
  item,
  renderWeatherIcon,
  videoMuted,
  setVideoMuted,
  weatherData
}: {
  item: WidgetItem;
  renderWeatherIcon: any;
  videoMuted: boolean;
  setVideoMuted: any;
  weatherData: any;
}) {
  const textColor = item.config.textColor || "#ffffff";
  const bgColor = item.config.bgColor || "#0f172a";

  switch (item.type) {
    case WidgetType.IMAGE: {
      const url = item.config.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";
      return (
        <div className="w-full h-full relative overflow-hidden">
          <img src={url} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent p-6 text-left">
            <h3 className="text-2xl font-black uppercase text-amber-500">{item.title}</h3>
            <p className="text-sm text-slate-300 mt-1">Imagem Corporativa • Nex Tv Indoor</p>
          </div>
        </div>
      );
    }

    case WidgetType.VIDEO: {
      const urls = item.config.url 
        ? item.config.url.split(",").map(u => u.trim()).filter(Boolean)
        : ["https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4"];
      
      const [currentIndex, setCurrentIndex] = useState(0);
      const url = urls[currentIndex % urls.length];

      const handleVideoEnded = () => {
        if (urls.length > 1) {
          setCurrentIndex((prev) => (prev + 1) % urls.length);
        }
      };

      const getYouTubeId = (videoUrl: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = videoUrl.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      };

      const youtubeId = getYouTubeId(url);

      return (
        <div className="w-full h-full relative bg-black flex justify-center items-center">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${videoMuted ? 1 : 0}&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0`}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <video
              key={url}
              src={url}
              autoPlay
              loop={urls.length === 1}
              onEnded={handleVideoEnded}
              muted={videoMuted}
              className="w-full h-full object-cover"
              playsInline
            />
          )}

          {/* Navigation Controls for Multiple Videos */}
          {urls.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-2 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev - 1 + urls.length) % urls.length);
                }}
                className="p-1.5 bg-slate-950/80 hover:bg-slate-850 rounded-lg text-slate-300 cursor-pointer border border-slate-800 flex items-center justify-center shadow-lg transition-all"
                title="Vídeo Anterior"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % urls.length);
                }}
                className="p-1.5 bg-slate-950/80 hover:bg-slate-850 rounded-lg text-slate-300 cursor-pointer border border-slate-800 flex items-center justify-center shadow-lg transition-all"
                title="Próximo Vídeo"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* Mute/Unmute Overlay Control */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setVideoMuted(!videoMuted);
            }}
            className="absolute bottom-4 right-4 p-2.5 bg-slate-950/80 hover:bg-slate-800 rounded-full cursor-pointer z-20 border border-slate-700/80"
          >
            {videoMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
          
          <div className="absolute top-4 left-4 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center gap-1.5 z-20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">
              MÍDIA DE VÍDEO {urls.length > 1 ? `(${currentIndex % urls.length + 1}/${urls.length})` : ""}
            </span>
          </div>
        </div>
      );
    }

    case WidgetType.CLOCK: {
      return (
        <div className="flex flex-col items-center justify-center p-8 w-full h-full bg-slate-950 text-center">
          <ClockIcon className="w-16 h-16 text-amber-500 mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-400 mb-2 uppercase tracking-widest">Hora Certa</h2>
          <Clock />
        </div>
      );
    }

    case WidgetType.WEATHER: {
      const city = item.config.city || "Teixeira de Freitas";
      const data = weatherData && weatherData.city.toLowerCase().includes(city.toLowerCase()) ? weatherData : {
        city: `${city}, BA`,
        temp: 28,
        humidity: 68,
        windSpeed: 10,
        condition: "Parcialmente Nublado",
        icon: "cloud-sun"
      };

      return (
        <div className="flex flex-col items-center justify-center p-10 w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 text-center relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-sky-500/5 rounded-full blur-3xl" />

          {renderWeatherIcon(data.icon, "w-28 h-28 mb-4 filter drop-shadow-[0_10px_15px_rgba(245,158,11,0.2)]")}
          <h2 className="text-5xl font-black tracking-tight text-white">{data.temp}°C</h2>
          <p className="text-2xl font-extrabold text-amber-500 mt-2 uppercase tracking-wide">{data.city}</p>
          <p className="text-md text-slate-400 mt-1 capitalize font-medium">{data.condition}</p>

          <div className="flex gap-8 mt-6 bg-slate-900/80 border border-slate-800/80 px-6 py-3 rounded-2xl">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Humidade</p>
              <p className="text-lg font-black text-slate-200">{data.humidity}%</p>
            </div>
            <div className="w-px bg-slate-800" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Ventos</p>
              <p className="text-lg font-black text-slate-200">{data.windSpeed} km/h</p>
            </div>
          </div>
        </div>
      );
    }

    case WidgetType.STOCKS: {
      const items = item.config.items || [
        { name: "Dólar Comercial", symbol: "USD/BRL", value: "R$ 5,42", change: "+0.32%", isUp: true },
        { name: "Euro", symbol: "EUR/BRL", value: "R$ 5,81", change: "-0.15%", isUp: false },
        { name: "Bitcoin", symbol: "BTC/BRL", value: "R$ 345.500", change: "+2.41%", isUp: true },
        { name: "Ibovespa", symbol: "IBOV", value: "121.250 pts", change: "+0.65%", isUp: true }
      ];

      return (
        <div className="p-8 w-full h-full bg-slate-900 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-black uppercase text-amber-500 tracking-widest mb-6 flex items-center gap-2">
            📊 MERCADO FINANCEIRO
          </h2>
          <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
            {items.map((stock: any, i: number) => (
              <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between relative overflow-hidden shadow-lg">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${stock.isUp ? "bg-emerald-500" : "bg-rose-500"}`} />
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">{stock.name}</p>
                  <p className="text-lg font-black font-mono tracking-wide text-slate-100 mt-1">{stock.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">{stock.symbol}</p>
                </div>
                <div className={`text-right px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 ${stock.isUp ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40" : "bg-rose-950/80 text-rose-400 border border-rose-800/40"}`}>
                  {stock.isUp ? "▲" : "▼"} {stock.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case WidgetType.TEXT: {
      const text = item.config.tickerText || "Insira um aviso corporativo ou anúncio comercial que será exibido de forma destacada e profissional nas TVs de mídia indoor.";
      const sizeClasses: Record<string, string> = {
        sm: "text-lg md:text-xl leading-relaxed",
        md: "text-2xl md:text-3xl font-bold leading-relaxed",
        lg: "text-4xl md:text-5xl font-black tracking-tight leading-snug",
        xl: "text-5xl md:text-7xl font-extrabold tracking-tight leading-none"
      };

      return (
        <div
          className="flex flex-col items-center justify-center p-12 w-full h-full text-center relative"
          style={{ backgroundColor: bgColor }}
        >
          <div className="absolute top-6 left-6 flex items-center gap-2 opacity-80">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs tracking-widest font-bold uppercase" style={{ color: textColor }}>AVISO DA DIRETORIA</span>
          </div>
          <p className={`${sizeClasses[item.config.fontSize || "md"]} max-w-4xl font-sans font-semibold drop-shadow`} style={{ color: textColor }}>
            "{text}"
          </p>
        </div>
      );
    }

    case WidgetType.QRCODE: {
      const qrUrl = item.config.qrUrl || "https://vtxmedia.com";
      const qrTitle = item.config.qrTitle || "Conecte-se Conosco";
      const qrDesc = item.config.qrDesc || "Aponte a câmera do seu celular no código QR para acessar nosso portal, redes sociais e cardápio digital.";
      const codeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}&color=0f172a&bgcolor=ffffff`;

      return (
        <div className="flex flex-col md:flex-row items-center justify-center p-8 w-full h-full bg-slate-900 gap-8">
          {/* Left QR Image */}
          <div className="bg-white p-4 rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col items-center shrink-0">
            <img src={codeImage} alt="QR Code" className="w-48 h-48 object-contain" />
            <div className="mt-3 flex items-center gap-1.5 text-slate-800 font-extrabold text-xs tracking-widest uppercase">
              <QrCode className="w-4.5 h-4.5 text-amber-500" /> ESCANEAR QR
            </div>
          </div>

          {/* Right Card */}
          <div className="text-left max-w-md">
            <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest">
              Acesso Rápido
            </span>
            <h2 className="text-3xl font-black uppercase text-white mt-3 leading-tight tracking-tight">{qrTitle}</h2>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed font-medium">{qrDesc}</p>
            <div className="flex items-center gap-2 mt-5 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 w-fit">
              <span className="text-xs font-mono text-amber-500 font-bold">{qrUrl}</span>
            </div>
          </div>
        </div>
      );
    }

    case WidgetType.COUNTDOWN: {
      const targetDate = item.config.countdownDate || "2026-12-31T23:59:59";
      const label = item.config.countdownLabel || "Grande Evento Anual Nex Tv";

      return (
        <div className="flex flex-col items-center justify-center p-8 w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
          <h4 className="text-sm font-extrabold text-amber-500 uppercase tracking-widest mb-2 border border-amber-500/30 px-3 py-1 rounded-full bg-amber-500/5">
            CONTAGEM REGRESSIVA
          </h4>
          <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tight max-w-2xl mt-2">{label}</h2>

          <CountdownTimer targetDate={targetDate} />
        </div>
      );
    }

    case WidgetType.NEWS: {
      const items = item.config.items || [
        { title: "Previsão do Tempo Semanal", content: "Frente fria se aproxima, trazendo chuvas isoladas e declínio nas temperaturas em diversas regiões." },
        { title: "Inovação no Transporte Público", content: "Novas frotas de ônibus elétricos começam a circular, visando reduzir a emissão de poluentes nas grandes cidades." }
      ];

      return (
        <div className="p-10 w-full h-full bg-slate-900 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-black uppercase text-amber-500 tracking-widest mb-6 flex items-center gap-2">
            📰 MANCHETES DO DIA
          </h2>
          <div className="space-y-4 w-full max-w-2xl">
            {items.map((news: any, i: number) => (
              <div key={i} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-xl text-left relative overflow-hidden">
                <span className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded">
                  REGIONAL
                </span>
                <h3 className="text-lg font-black text-slate-100">{news.title}</h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed font-medium">{news.content}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case WidgetType.LOTTERY: {
      const defaultLotteries = [
        { name: "Mega-Sena", draw: "Concurso 2734", date: "24/06/2026", numbers: ["04", "12", "32", "45", "49", "58"], prize: "R$ 42 Milhões" },
        { name: "Lotofácil", draw: "Concurso 3122", date: "24/06/2026", numbers: ["01", "03", "04", "06", "08", "09", "10", "12", "14", "15", "17", "18", "21", "22", "25"], prize: "R$ 1.7 Milhão" }
      ];
      const items = item.config.items || defaultLotteries;

      return (
        <div className="p-8 w-full h-full bg-slate-900 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-black uppercase text-amber-500 tracking-widest mb-6 flex items-center gap-2">
            🍀 RESULTADO DA LOTERIA
          </h2>
          <div className="space-y-4 w-full max-w-xl">
            {items.map((lot: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl text-left">
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <h3 className="text-md font-black text-slate-100 uppercase">{lot.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold">{lot.draw}</p>
                    <p className="text-[9px] text-slate-500">{lot.date}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {lot.numbers.map((num: string, idx: number) => (
                    <span key={idx} className="w-7 h-7 flex items-center justify-center rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs font-black">
                      {num}
                    </span>
                  ))}
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold">Estimativa de Prêmio</span>
                  <span className="text-emerald-400 font-black tracking-wide">{lot.prize}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case WidgetType.VERSE: {
      const topic = item.config.bibleTopic || "Geral";
      const presetList = topic === "Geral" ? BIBLE_PRESENTS : BIBLE_PRESENTS.filter(b => b.title === topic);
      const verseIndex = Math.floor(Date.now() / 60000) % presetList.length;
      const verse = item.config.items?.[0] || presetList[verseIndex] || BIBLE_PRESENTS[2];

      return (
        <div
          className="flex flex-col items-center justify-center p-12 w-full h-full text-center relative overflow-hidden font-serif"
          style={{ backgroundColor: bgColor }}
        >
          {/* Subtle Christian Icon graphic overlay */}
          <div className="absolute top-6 left-6 flex items-center gap-2 opacity-70 font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs tracking-widest font-black uppercase text-amber-500">Versículo do Dia ({topic})</span>
          </div>
          <div className="max-w-3xl">
            <span className="text-5xl text-amber-500 opacity-60 select-none block text-center mb-3">“</span>
            <p className="text-xl md:text-2xl lg:text-3xl font-medium italic leading-relaxed" style={{ color: textColor }}>
              {verse.content}
            </p>
            <p className="text-sm md:text-md uppercase tracking-wider font-extrabold text-amber-500 mt-6 font-sans">
              — {verse.extra}
            </p>
          </div>
        </div>
      );
    }

    case WidgetType.TRIVIA: {
      const topic = item.config.triviaTopic || "Geral";
      const presetList = topic === "Geral" ? TRIVIA_PRESENTS : TRIVIA_PRESENTS.filter(t => t.title === topic);
      const triviaIndex = Math.floor(Date.now() / 60000) % presetList.length;
      const trivia = item.config.items?.[0] || presetList[triviaIndex] || TRIVIA_PRESENTS[1];

      return (
        <div
          className="flex flex-col items-center justify-center p-12 w-full h-full text-center relative overflow-hidden"
          style={{ backgroundColor: bgColor }}
        >
          <div className="absolute top-6 left-6 flex items-center gap-2 opacity-80">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs tracking-widest font-black uppercase text-sky-400">CURIOSIDADE DO DIA ({topic})</span>
          </div>
          <div className="max-w-2xl">
            <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center rounded-2xl mx-auto mb-6 text-2xl shadow-lg">
              💡
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-4">
              {trivia.title}
            </h2>
            <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-200">
              "{trivia.content}"
            </p>
            <p className="text-xs uppercase tracking-widest font-bold text-sky-400 mt-6 bg-sky-950/40 px-3.5 py-1 rounded-full border border-sky-800/20 w-fit mx-auto">
              {trivia.extra}
            </p>
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="p-8 w-full h-full bg-slate-900 text-center flex flex-col justify-center items-center">
          <p>Widget do tipo {item.type} ainda em desenvolvimento.</p>
        </div>
      );
  }
}

// ----------------------------------------------------
// COUTDOWN TIMER HELPER COMPONENT
// ----------------------------------------------------
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="grid grid-cols-4 gap-4 mt-8 max-w-xl w-full">
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-glow flex flex-col items-center">
        <span className="text-4xl font-black font-mono tracking-wide text-amber-500">{pad(timeLeft.days)}</span>
        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Dias</span>
      </div>
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-glow flex flex-col items-center">
        <span className="text-4xl font-black font-mono tracking-wide text-amber-500">{pad(timeLeft.hours)}</span>
        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Horas</span>
      </div>
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-glow flex flex-col items-center">
        <span className="text-4xl font-black font-mono tracking-wide text-amber-500">{pad(timeLeft.minutes)}</span>
        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Minutos</span>
      </div>
      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-glow flex flex-col items-center">
        <span className="text-4xl font-black font-mono tracking-wide text-amber-500">{pad(timeLeft.seconds)}</span>
        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Segundos</span>
      </div>
    </div>
  );
}
