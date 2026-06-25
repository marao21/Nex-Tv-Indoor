import { useState } from "react";
import { Screen, WidgetItem, WidgetType } from "../types";
import {
  ArrowLeft,
  Tv,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Link2,
  Check,
  ToggleLeft,
  ToggleRight,
  Settings,
  Image as ImageIcon,
  Video,
  Clock,
  Sun,
  TrendingUp,
  FileText,
  QrCode,
  Hourglass,
  Newspaper,
  Dices,
  BookOpen,
  HelpCircle,
  X,
  Volume2
} from "lucide-react";
import { PRESET_IMAGES, PRESET_VIDEOS } from "../data";
import TVPlayer from "./TVPlayer";

interface ScreenConfiguratorProps {
  screen: Screen;
  onBack: () => void;
  onSave: (updatedScreen: Screen) => void;
}

export default function ScreenConfigurator({ screen, onBack, onSave }: ScreenConfiguratorProps) {
  const [editedScreen, setEditedScreen] = useState<Screen>({ ...screen });
  const [activeWidget, setActiveWidget] = useState<WidgetItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Widget icons lookup
  const getWidgetIcon = (type: WidgetType, className = "w-5 h-5") => {
    switch (type) {
      case WidgetType.IMAGE: return <ImageIcon className={`${className} text-emerald-500`} />;
      case WidgetType.VIDEO: return <Video className={`${className} text-indigo-500`} />;
      case WidgetType.CLOCK: return <Clock className={`${className} text-sky-500`} />;
      case WidgetType.WEATHER: return <Sun className={`${className} text-amber-500`} />;
      case WidgetType.STOCKS: return <TrendingUp className={`${className} text-teal-500`} />;
      case WidgetType.TEXT: return <FileText className={`${className} text-red-500`} />;
      case WidgetType.QRCODE: return <QrCode className={`${className} text-purple-500`} />;
      case WidgetType.COUNTDOWN: return <Hourglass className={`${className} text-orange-500`} />;
      case WidgetType.NEWS: return <Newspaper className={`${className} text-yellow-500`} />;
      case WidgetType.LOTTERY: return <Dices className={`${className} text-violet-500`} />;
      case WidgetType.VERSE: return <BookOpen className={`${className} text-pink-500`} />;
      case WidgetType.TRIVIA: return <HelpCircle className={`${className} text-cyan-500`} />;
    }
  };

  // Human readable type names
  const getWidgetName = (type: WidgetType) => {
    switch (type) {
      case WidgetType.IMAGE: return "Imagem de Slide";
      case WidgetType.VIDEO: return "Vídeo por link";
      case WidgetType.CLOCK: return "Relógio Digital/Analógico";
      case WidgetType.WEATHER: return "Clima e Temperatura";
      case WidgetType.STOCKS: return "Cotações Financeiras";
      case WidgetType.TEXT: return "Aviso / Texto Customizado";
      case WidgetType.QRCODE: return "QR Code Dinâmico";
      case WidgetType.COUNTDOWN: return "Contagem Regressiva";
      case WidgetType.NEWS: return "Painel de Notícias";
      case WidgetType.LOTTERY: return "Resultados de Loteria";
      case WidgetType.VERSE: return "Versículo Bíblico do Dia";
      case WidgetType.TRIVIA: return "Curiosidades Fascinantes";
    }
  };

  // Reorder widgets
  const moveWidget = (index: number, direction: "up" | "down") => {
    const newItems = [...editedScreen.items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Swap
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    const updated = { ...editedScreen, items: newItems, updatedAt: new Date().toISOString() };
    setEditedScreen(updated);
    onSave(updated);
  };

  // Toggle widget active state
  const toggleWidgetActive = (index: number) => {
    const newItems = [...editedScreen.items];
    newItems[index] = { ...newItems[index], active: !newItems[index].active };

    const updated = { ...editedScreen, items: newItems, updatedAt: new Date().toISOString() };
    setEditedScreen(updated);
    onSave(updated);
  };

  // Update widget duration
  const updateWidgetDuration = (index: number, val: number) => {
    if (isNaN(val) || val <= 0) return;
    const newItems = [...editedScreen.items];
    newItems[index] = { ...newItems[index], duration: val };

    const updated = { ...editedScreen, items: newItems, updatedAt: new Date().toISOString() };
    setEditedScreen(updated);
    onSave(updated);
  };

  // Delete widget
  const deleteWidget = (index: number) => {
    if (!confirm("Tem certeza que deseja remover este widget?")) return;
    const newItems = editedScreen.items.filter((_, idx) => idx !== index);

    const updated = { ...editedScreen, items: newItems, updatedAt: new Date().toISOString() };
    setEditedScreen(updated);
    onSave(updated);
  };

  // Add new widget action
  const handleAddWidget = (type: WidgetType) => {
    const defaultConfigs: Record<WidgetType, any> = {
      [WidgetType.IMAGE]: { url: PRESET_IMAGES[0].url },
      [WidgetType.VIDEO]: { url: PRESET_VIDEOS[0].url },
      [WidgetType.CLOCK]: { clockStyle: "digital" },
      [WidgetType.WEATHER]: { city: "Teixeira de Freitas" },
      [WidgetType.STOCKS]: {},
      [WidgetType.TEXT]: { tickerText: "Escreva seu aviso corporativo aqui...", textColor: "#ffffff", bgColor: "#991b1b", fontSize: "md" },
      [WidgetType.QRCODE]: { qrUrl: "https://google.com", qrTitle: "Acesse nosso site", qrDesc: "Aponte a câmera do seu celular para escanear." },
      [WidgetType.COUNTDOWN]: { countdownDate: "2026-12-31T23:59:59", countdownLabel: "Festa de Fim de Ano" },
      [WidgetType.NEWS]: { newsCategory: "geral" },
      [WidgetType.LOTTERY]: {},
      [WidgetType.VERSE]: { bibleTopic: "Paz", textColor: "#ffffff", bgColor: "#1e1b4b" },
      [WidgetType.TRIVIA]: { triviaTopic: "Ciência", textColor: "#ffffff", bgColor: "#124e3f" }
    };

    const newWidget: WidgetItem = {
      id: "widget-" + Date.now(),
      type,
      title: getWidgetName(type),
      duration: 10,
      active: true,
      config: defaultConfigs[type]
    };

    const updated = {
      ...editedScreen,
      items: [...editedScreen.items, newWidget],
      updatedAt: new Date().toISOString()
    };

    setEditedScreen(updated);
    onSave(updated);
    setShowAddModal(false);

    // Auto open edit settings for widgets that need text setups
    setActiveWidget(newWidget);
    setShowEditModal(true);
  };

  // Save specific widget custom config
  const handleSaveWidgetConfig = (updatedWidget: WidgetItem) => {
    const newItems = editedScreen.items.map(item =>
      item.id === updatedWidget.id ? updatedWidget : item
    );

    const updated = {
      ...editedScreen,
      items: newItems,
      updatedAt: new Date().toISOString()
    };

    setEditedScreen(updated);
    onSave(updated);
    setShowEditModal(false);
    setActiveWidget(null);
  };

  // AI Gemini Generation inside Widget
  const generateWithAi = async (type: string, topic: string) => {
    if (!activeWidget) return;
    setIsAiGenerating(true);

    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, prompt: topic, count: 1 })
      });
      const data = await response.json();

      if (data.success && data.items && data.items.length > 0) {
        const item = data.items[0];

        // Specific mapping
        if (activeWidget.type === WidgetType.VERSE) {
          setActiveWidget({
            ...activeWidget,
            config: {
              ...activeWidget.config,
              bibleTopic: topic,
              items: [{ content: item.content, extra: item.extra || topic }]
            }
          });
        } else if (activeWidget.type === WidgetType.TRIVIA) {
          setActiveWidget({
            ...activeWidget,
            config: {
              ...activeWidget.config,
              triviaTopic: topic,
              items: [{ title: item.title, content: item.content, extra: item.extra || topic }]
            }
          });
        } else if (activeWidget.type === WidgetType.TEXT) {
          setActiveWidget({
            ...activeWidget,
            config: {
              ...activeWidget.config,
              tickerText: item.content
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Copy Screen TV link
  const copyTvLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?tv=${editedScreen.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open Player in new window
  const openPlayerWindow = () => {
    const url = `${window.location.origin}${window.location.pathname}?tv=${editedScreen.id}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Action Bar */}
      <div className="bg-slate-900 border-b border-slate-800 py-3.5 px-6 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 hover:text-amber-500 transition-colors text-slate-300 font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Voltar
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={copyTvLink}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border transition-all cursor-pointer ${
              copied
                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200"
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
            {copied ? "Link Copiado!" : "Copiar link da TV"}
          </button>
          <button
            onClick={openPlayerWindow}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/15"
          >
            <Tv className="w-4 h-4" /> Abrir Player
          </button>
        </div>
      </div>

      {/* Main Grid: Config vs Preview */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-800/80 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
            <h3 className="text-lg font-black uppercase text-slate-100 mb-5 flex items-center gap-2">
              ⚙️ Parâmetros da Tela
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Nome da Tela
                </label>
                <input
                  type="text"
                  value={editedScreen.name}
                  onChange={(e) => {
                    const updated = { ...editedScreen, name: e.target.value, updatedAt: new Date().toISOString() };
                    setEditedScreen(updated);
                    onSave(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none rounded-xl px-4 py-2.5 text-slate-100 text-sm font-semibold transition-all"
                  placeholder="Ex: regional, recepcao, copa"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={editedScreen.description}
                  onChange={(e) => {
                    const updated = { ...editedScreen, description: e.target.value, updatedAt: new Date().toISOString() };
                    setEditedScreen(updated);
                    onSave(updated);
                  }}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none rounded-xl px-4 py-2.5 text-slate-100 text-sm font-semibold transition-all resize-none"
                  placeholder="Escreva sobre a localização ou propósito desta tela..."
                />
              </div>

              {/* Orientation Option */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  Orientação da Tela
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const updated = { ...editedScreen, orientation: "horizontal" as const, updatedAt: new Date().toISOString() };
                      setEditedScreen(updated);
                      onSave(updated);
                    }}
                    className={`py-3 rounded-xl font-bold text-xs uppercase flex flex-col items-center gap-1.5 border transition-all cursor-pointer ${
                      editedScreen.orientation === "horizontal"
                        ? "bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    <Tv className="w-5 h-5 rotate-0" />
                    Horizontal
                  </button>
                  <button
                    onClick={() => {
                      const updated = { ...editedScreen, orientation: "vertical" as const, updatedAt: new Date().toISOString() };
                      setEditedScreen(updated);
                      onSave(updated);
                    }}
                    className={`py-3 rounded-xl font-bold text-xs uppercase flex flex-col items-center gap-1.5 border transition-all cursor-pointer ${
                      editedScreen.orientation === "vertical"
                        ? "bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    <Tv className="w-5 h-5 rotate-90" />
                    Vertical
                  </button>
                </div>
                {editedScreen.orientation === "vertical" && (
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">
                    * No modo vertical, o conteúdo se adapta automaticamente para monitores ou TVs virados em 90°.
                  </p>
                )}
              </div>

              {/* Split Screen Toggle */}
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => {
                    const updated = { ...editedScreen, splitScreen: !editedScreen.splitScreen, updatedAt: new Date().toISOString() };
                    setEditedScreen(updated);
                    onSave(updated);
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-black uppercase text-slate-200">Modo Tela Dividida</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Exibe Relógio, Clima, Cotações e Notícias ao redor do slide.</p>
                  </div>
                  {editedScreen.splitScreen ? (
                    <ToggleRight className="w-8 h-8 text-amber-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>

              {/* News Ticker Toggle */}
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => {
                    const updated = { ...editedScreen, showNewsTicker: editedScreen.showNewsTicker === false ? true : false, updatedAt: new Date().toISOString() };
                    setEditedScreen(updated);
                    onSave(updated);
                  }}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800 hover:border-slate-700 transition-all text-left cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-black uppercase text-slate-200">Barra de Notícias Inferior</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Exibe a barra de notícias rolando na parte inferior da tela.</p>
                  </div>
                  {editedScreen.showNewsTicker !== false ? (
                    <ToggleRight className="w-8 h-8 text-amber-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right TV Mockup Preview (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="text-center mb-2 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500">Live TV Preview (Loop de Slides)</p>
          </div>
          <TVPlayer screen={editedScreen} isEmbedPreview={true} />
        </div>
      </div>

      {/* Medias and Widgets Management Section */}
      <div className="max-w-7xl w-full mx-auto px-6 pb-12">
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black uppercase text-slate-100 flex items-center gap-2">
                🗂️ Mídias &amp; Widgets
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Configure, reordene e defina o loop de exibição das telas.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold rounded-xl text-xs uppercase flex items-center gap-2 text-amber-400 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Adicionar Widget
            </button>
          </div>

          {/* List of Widgets */}
          <div className="space-y-3">
            {editedScreen.items.length === 0 ? (
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center">
                <Plus className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-sm font-semibold text-slate-400">Sua tela não possui mídias ou widgets</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-xs uppercase font-black text-amber-500 hover:text-amber-400"
                >
                  Adicionar meu primeiro widget
                </button>
              </div>
            ) : (
              editedScreen.items.map((item, idx) => (
                <div
                  key={item.id}
                  className={`bg-slate-950/80 border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 transition-all ${
                    item.active ? "border-slate-800" : "border-slate-900 opacity-60"
                  }`}
                >
                  {/* Left Controls & Info */}
                  <div className="flex items-center gap-4 min-w-[240px]">
                    {/* Order buttons */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveWidget(idx, "up")}
                        disabled={idx === 0}
                        className="p-1 hover:bg-slate-900 text-slate-500 hover:text-amber-500 disabled:opacity-20 cursor-pointer"
                        title="Mover para cima"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveWidget(idx, "down")}
                        disabled={idx === editedScreen.items.length - 1}
                        className="p-1 hover:bg-slate-900 text-slate-500 hover:text-amber-500 disabled:opacity-20 cursor-pointer"
                        title="Mover para baixo"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Widget Icon & Title */}
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                      {getWidgetIcon(item.type, "w-6 h-6")}
                    </div>

                    <div>
                      <h4 className="text-sm font-extrabold text-slate-200 capitalize">
                        {item.type === WidgetType.WEATHER
                          ? `Clima: ${item.config.city || "Teixeira de Freitas"}`
                          : item.type === WidgetType.TEXT
                          ? `Aviso: "${item.config.tickerText?.substring(0, 20)}..."`
                          : item.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          {item.type}
                        </span>
                        {item.active ? (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 px-1.5 rounded flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Ativo
                          </span>
                        ) : (
                          <span className="text-[9px] font-extrabold text-slate-500 bg-slate-900 border border-slate-800 px-1.5 rounded">
                            Pausado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right duration control and action buttons */}
                  <div className="flex items-center gap-4">
                    {/* Duration input */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tempo:</span>
                      <div className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 flex items-center w-20">
                        <input
                          type="number"
                          value={item.duration}
                          onChange={(e) => updateWidgetDuration(idx, parseInt(e.target.value))}
                          className="w-full bg-transparent outline-none border-none text-slate-200 font-bold font-mono text-center text-sm"
                          min={2}
                          max={300}
                        />
                        <span className="text-[10px] font-bold text-slate-500 ml-1">seg</span>
                      </div>
                    </div>

                    {/* Active Toggle Switch */}
                    <button
                      onClick={() => toggleWidgetActive(idx)}
                      className="p-1 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                      title={item.active ? "Desativar widget" : "Ativar widget"}
                    >
                      {item.active ? (
                        <ToggleRight className="w-7 h-7 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-7 h-7 text-slate-600" />
                      )}
                    </button>

                    {/* Edit Custom properties */}
                    <button
                      onClick={() => {
                        setActiveWidget(item);
                        setShowEditModal(true);
                      }}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-black uppercase cursor-pointer"
                    >
                      <Settings className="w-4 h-4" /> Configurar
                    </button>

                    {/* Trash delete button */}
                    <button
                      onClick={() => deleteWidget(idx)}
                      className="p-2 hover:bg-rose-950/50 hover:text-rose-400 text-slate-500 rounded-lg transition-colors cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 1. ADD WIDGET MODAL (3x4 GRID OF WIDGETS) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-100 mb-1 flex items-center gap-2">
              ➕ Adicionar Widget
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Escolha qual tipo de conteúdo deseja exibir no loop de sua TV.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(WidgetType) as Array<keyof typeof WidgetType>).map((key) => {
                const type = WidgetType[key];
                return (
                  <button
                    key={type}
                    onClick={() => handleAddWidget(type)}
                    className="p-3.5 bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-900 hover:shadow-lg rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 transition-all group cursor-pointer"
                  >
                    <div className="p-2.5 bg-slate-900 rounded-xl group-hover:scale-105 transition-transform">
                      {getWidgetIcon(type, "w-6 h-6")}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-300 group-hover:text-amber-500">
                      {getWidgetName(type)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. CUSTOM EDIT PROPERTIES MODAL */}
      {showEditModal && activeWidget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => {
                setShowEditModal(false);
                setActiveWidget(null);
              }}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4 mb-5">
              <div className="p-2.5 bg-slate-950 rounded-xl">
                {getWidgetIcon(activeWidget.type, "w-6 h-6")}
              </div>
              <div>
                <h3 className="text-md font-black uppercase text-slate-100">
                  Configurar {getWidgetName(activeWidget.type)}
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">{activeWidget.type}</p>
              </div>
            </div>

            {/* Config Fields based on Widget Type */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {/* Common Title/Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Título de Exibição
                  </label>
                  <input
                    type="text"
                    value={activeWidget.title}
                    onChange={(e) => setActiveWidget({ ...activeWidget, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Duração (segundos)
                  </label>
                  <input
                    type="number"
                    value={activeWidget.duration}
                    onChange={(e) => setActiveWidget({ ...activeWidget, duration: parseInt(e.target.value) || 10 })}
                    className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-semibold"
                    min={2}
                  />
                </div>
              </div>

              {/* IMAGE TYPE CONFIG */}
              {activeWidget.type === WidgetType.IMAGE && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      URL da Imagem
                    </label>
                    <input
                      type="text"
                      value={activeWidget.config.url || ""}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, url: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-mono"
                      placeholder="https://sua-imagem.com/foto.jpg"
                    />
                  </div>

                  {/* Image presets list */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Ou escolha um Template Corporativo/Comercial
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, url: img.url } })}
                          className={`p-2 border rounded-xl text-left bg-slate-950 hover:bg-slate-900 transition-colors flex flex-col gap-1 cursor-pointer ${
                            activeWidget.config.url === img.url ? "border-amber-500" : "border-slate-800"
                          }`}
                        >
                          <img src={img.url} className="w-full h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                          <span className="text-[9px] font-bold text-slate-400 truncate w-full">{img.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIDEO TYPE CONFIG */}
              {activeWidget.type === WidgetType.VIDEO && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      URL do Vídeo (MP4, Direct Link)
                    </label>
                    <input
                      type="text"
                      value={activeWidget.config.url || ""}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, url: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-mono"
                      placeholder="https://meusite.com/video.mp4"
                    />
                  </div>

                  {/* Video presets list */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Ou selecione um Vídeo de Relaxamento/Estético
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PRESET_VIDEOS.map((vid, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, url: vid.url } })}
                          className={`p-2 border rounded-xl text-left bg-slate-950 hover:bg-slate-900 transition-all flex items-center gap-2 cursor-pointer ${
                            activeWidget.config.url === vid.url ? "border-amber-500" : "border-slate-800"
                          }`}
                        >
                          <Video className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-300 truncate">{vid.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* WEATHER TYPE CONFIG */}
              {activeWidget.type === WidgetType.WEATHER && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={activeWidget.config.city || ""}
                    onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, city: e.target.value } })}
                    className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-semibold"
                    placeholder="Ex: Teixeira de Freitas, São Paulo"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-medium">Buscamos automaticamente as coordenadas e previsões reais.</p>
                </div>
              )}

              {/* NEWS TYPE CONFIG */}
              {activeWidget.type === WidgetType.NEWS && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                    Categoria de Notícias
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {["geral", "tecnologia", "esportes", "curiosidades"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, newsCategory: cat } })}
                        className={`py-2 rounded-xl text-xs font-bold uppercase border cursor-pointer ${
                          activeWidget.config.newsCategory === cat
                            ? "bg-amber-500 border-amber-500 text-slate-950"
                            : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TEXT TYPE CONFIG */}
              {activeWidget.type === WidgetType.TEXT && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Texto do Comunicado
                      </label>
                      <button
                        onClick={() => generateWithAi("announcement", "RH / Geral")}
                        disabled={isAiGenerating}
                        className="text-[10px] font-black text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> {isAiGenerating ? "Gerando..." : "Gerar com IA VTX"}
                      </button>
                    </div>
                    <textarea
                      value={activeWidget.config.tickerText || ""}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, tickerText: e.target.value } })}
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2.5 text-slate-100 text-xs font-semibold resize-none"
                      placeholder="Insira o texto que ocupará o centro da TV de mídia indoor..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Cor do Texto
                      </label>
                      <input
                        type="color"
                        value={activeWidget.config.textColor || "#ffffff"}
                        onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, textColor: e.target.value } })}
                        className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Cor de Fundo
                      </label>
                      <input
                        type="color"
                        value={activeWidget.config.bgColor || "#991b1b"}
                        onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, bgColor: e.target.value } })}
                        className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Tamanho da Fonte
                      </label>
                      <select
                        value={activeWidget.config.fontSize || "md"}
                        onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, fontSize: e.target.value } })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg outline-none px-2.5 h-8 text-xs font-bold text-slate-300"
                      >
                        <option value="sm">Pequeno</option>
                        <option value="md">Médio</option>
                        <option value="lg">Grande</option>
                        <option value="xl">Gigante</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* QR CODE TYPE CONFIG */}
              {activeWidget.type === WidgetType.QRCODE && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Link / URL de Destino (Para onde vai ao escanear)
                    </label>
                    <input
                      type="text"
                      value={activeWidget.config.qrUrl || ""}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, qrUrl: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-mono"
                      placeholder="https://seu-restaurante.com/cardapio"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Título Informativo (Exibido ao lado)
                    </label>
                    <input
                      type="text"
                      value={activeWidget.config.qrTitle || ""}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, qrTitle: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Instruções / Descrição de Apoio
                    </label>
                    <textarea
                      value={activeWidget.config.qrDesc || ""}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, qrDesc: e.target.value } })}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-semibold resize-none"
                    />
                  </div>
                </div>
              )}

              {/* COUNTDOWN TYPE CONFIG */}
              {activeWidget.type === WidgetType.COUNTDOWN && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Data &amp; Hora Limite
                    </label>
                    <input
                      type="datetime-local"
                      value={activeWidget.config.countdownDate || ""}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, countdownDate: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Nome do Evento / Rótulo
                    </label>
                    <input
                      type="text"
                      value={activeWidget.config.countdownLabel || ""}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, countdownLabel: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 outline-none rounded-xl px-3.5 py-2 text-slate-100 text-xs font-semibold"
                      placeholder="Ex: Fim do Ano Corporativo"
                    />
                  </div>
                </div>
              )}

              {/* VERSE TYPE CONFIG */}
              {activeWidget.type === WidgetType.VERSE && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Tema Bíblico
                      </label>
                      <button
                        onClick={() => generateWithAi("verse", activeWidget.config.bibleTopic || "Paz")}
                        disabled={isAiGenerating}
                        className="text-[10px] font-black text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> {isAiGenerating ? "Gerando Versículo..." : "Gerar Versículo com IA"}
                      </button>
                    </div>
                    <select
                      value={activeWidget.config.bibleTopic || "Paz"}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, bibleTopic: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl outline-none px-3 py-2 text-xs font-bold text-slate-300 h-10"
                    >
                      {["Esperança", "Força", "Paz", "Fé", "Amor"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {activeWidget.config.items?.[0] && (
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Visualização do Versículo Gerado</p>
                      <p className="text-xs italic text-slate-200">"{activeWidget.config.items[0].content}"</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-2">— {activeWidget.config.items[0].extra}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Cor do Texto
                      </label>
                      <input
                        type="color"
                        value={activeWidget.config.textColor || "#ffffff"}
                        onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, textColor: e.target.value } })}
                        className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Cor de Fundo
                      </label>
                      <input
                        type="color"
                        value={activeWidget.config.bgColor || "#1e1b4b"}
                        onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, bgColor: e.target.value } })}
                        className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TRIVIA TYPE CONFIG */}
              {activeWidget.type === WidgetType.TRIVIA && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Tema de Curiosidades
                      </label>
                      <button
                        onClick={() => generateWithAi("trivia", activeWidget.config.triviaTopic || "Ciência")}
                        disabled={isAiGenerating}
                        className="text-[10px] font-black text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> {isAiGenerating ? "Gerando Fato..." : "Gerar Curiosidade com IA"}
                      </button>
                    </div>
                    <select
                      value={activeWidget.config.triviaTopic || "Ciência"}
                      onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, triviaTopic: e.target.value } })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl outline-none px-3 py-2 text-xs font-bold text-slate-300 h-10"
                    >
                      {["Espaço", "Ciência", "Animais", "História", "Natureza"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {activeWidget.config.items?.[0] && (
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
                      <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1">Visualização da Curiosidade Gerada</p>
                      <h4 className="text-xs font-black text-slate-100">{activeWidget.config.items[0].title}</h4>
                      <p className="text-xs text-slate-300 mt-1">"{activeWidget.config.items[0].content}"</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Cor do Texto
                      </label>
                      <input
                        type="color"
                        value={activeWidget.config.textColor || "#ffffff"}
                        onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, textColor: e.target.value } })}
                        className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        Cor de Fundo
                      </label>
                      <input
                        type="color"
                        value={activeWidget.config.bgColor || "#124e3f"}
                        onChange={(e) => setActiveWidget({ ...activeWidget, config: { ...activeWidget.config, bgColor: e.target.value } })}
                        className="w-full h-8 bg-slate-950 border border-slate-800 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal action buttons */}
            <div className="border-t border-slate-800/60 pt-4 mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setActiveWidget(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveWidgetConfig(activeWidget)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase cursor-pointer"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
