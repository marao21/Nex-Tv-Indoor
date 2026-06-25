import React, { useState } from "react";
import { Screen, WidgetType } from "../types";
import {
  Plus,
  Tv,
  Trash2,
  ExternalLink,
  Copy,
  Clock,
  LayoutGrid,
  Check,
  User,
  Activity,
  Calendar,
  Sparkles
} from "lucide-react";

interface AdminPanelProps {
  screens: Screen[];
  onSelectScreen: (screen: Screen) => void;
  onCreateScreen: (name: string, template?: string) => void;
  onDeleteScreen: (id: string) => void;
}

export default function AdminPanel({ screens, onSelectScreen, onCreateScreen, onDeleteScreen }: AdminPanelProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newScreenName, setNewScreenName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("empty");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?tv=${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenPlayer = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?tv=${id}`;
    window.open(url, "_blank");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName.trim()) return;
    onCreateScreen(newScreenName.trim(), selectedTemplate);
    setNewScreenName("");
    setSelectedTemplate("empty");
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center font-black text-slate-950 text-xs shadow-lg shadow-amber-500/10">
            NEX
          </div>
          <div>
            <h1 className="text-md font-black uppercase tracking-wider text-white">Nex Tv Indoor</h1>
            <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">Sinalização Digital Integrada</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Servidor Online
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/15"
          >
            <Plus className="w-4 h-4" /> Nova tela
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-10">
        {/* Title Section */}
        <div>
          <h2 className="text-xl font-black uppercase text-white tracking-tight">Suas telas</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Cada tela representa um reprodutor de mídia único que roda em loop nas TVs ou monitores comerciais.
          </p>
        </div>

        {/* Screen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => {
            const activeWidgetsCount = screen.items.filter(i => i.active).length;
            const formattedDate = new Date(screen.updatedAt).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div
                key={screen.id}
                onClick={() => onSelectScreen(screen)}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all relative group cursor-pointer flex flex-col justify-between min-h-[190px]"
              >
                {/* Delete button (trash can) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Tem certeza que deseja excluir a tela "${screen.name}"?`)) {
                      onDeleteScreen(screen.id);
                    }
                  }}
                  className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-rose-950/80 hover:text-rose-400 text-slate-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Excluir tela"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Card Top Information */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-md font-black text-white uppercase group-hover:text-amber-500 transition-colors">
                      {screen.name}
                    </h3>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {screen.orientation}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400">Online</span>
                    <span className="text-slate-600 font-normal">| {activeWidgetsCount} widgets ativos</span>
                  </div>
                </div>

                {/* Card Bottom / Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    <span>Alt: {formattedDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleCopyLink(e, screen.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                        copiedId === screen.id
                          ? "bg-emerald-950 border-emerald-800 text-emerald-400"
                          : "bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-400"
                      }`}
                      title="Copiar URL para TV"
                    >
                      {copiedId === screen.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === screen.id ? "Copiado!" : "Copiar"}
                    </button>
                    <button
                      onClick={(e) => handleOpenPlayer(e, screen.id)}
                      className="px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-500 font-black rounded-lg text-[10px] uppercase flex items-center gap-1 transition-all"
                      title="Abrir reprodutor de TV"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> TV
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dotted Create Screen Card */}
          <div
            onClick={() => setShowCreateModal(true)}
            className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/10 hover:bg-slate-900/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 cursor-pointer group transition-all min-h-[190px]"
          >
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-6 h-6 text-slate-400 group-hover:text-amber-500 transition-colors" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-300 uppercase">Nova Tela</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium">Adicione um novo monitor ou TV indoor.</p>
            </div>
          </div>
        </div>

        {/* Explain Card */}
        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 text-lg">
            📺
          </div>
          <div className="text-xs text-slate-400 leading-relaxed font-medium">
            <span className="font-bold text-amber-500 block mb-0.5 uppercase tracking-wide">Como colocar nas Smart TVs?</span>
            Basta abrir o navegador de internet da sua TV (como LG WebOS, Samsung Tizen ou qualquer Android TV) e acessar o link copiado de cada tela. O sistema roda de forma 100% autônoma, em loop contínuo e com atualizações automáticas e em tempo real quando você altera o painel!
          </div>
        </div>

        {/* Pre-seeded Projects Templates Showcase */}
        <div className="pt-6 border-t border-slate-800/60">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-md font-black uppercase text-white tracking-wide">Modelos Rápidos / Templates</h3>
          </div>
          <p className="text-xs text-slate-500 mb-6 font-medium">Adicione instantaneamente estruturas completas pré-configuradas para comércios e escritórios.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => onCreateScreen("Menu Lanchonete", "menu")}
              className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl text-left flex flex-col justify-between min-h-[120px] transition-all group cursor-pointer"
            >
              <div>
                <span className="text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded uppercase border border-emerald-900/30">Lanchonetes</span>
                <h4 className="text-sm font-black uppercase text-slate-200 mt-2.5 group-hover:text-emerald-400 transition-colors">Menu Digital Burger</h4>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">Preset de fotos de hambúrguer, promoções, QR code e cotações.</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2.5 block">Usar Modelo →</span>
            </button>

            <button
              onClick={() => onCreateScreen("Recepção de Clínica", "clinic")}
              className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-sky-500/50 rounded-2xl text-left flex flex-col justify-between min-h-[120px] transition-all group cursor-pointer"
            >
              <div>
                <span className="text-[9px] font-black tracking-widest text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded uppercase border border-sky-900/30">Consultórios</span>
                <h4 className="text-sm font-black uppercase text-slate-200 mt-2.5 group-hover:text-sky-400 transition-colors">Recepção Médica</h4>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">Painel de hora certa, clima atual, avisos de saúde e notícias locais.</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2.5 block">Usar Modelo →</span>
            </button>

            <button
              onClick={() => onCreateScreen("Mural de Avisos", "office")}
              className="p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 hover:border-violet-500/50 rounded-2xl text-left flex flex-col justify-between min-h-[120px] transition-all group cursor-pointer"
            >
              <div>
                <span className="text-[9px] font-black tracking-widest text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded uppercase border border-violet-900/30">Escritórios</span>
                <h4 className="text-sm font-black uppercase text-slate-200 mt-2.5 group-hover:text-violet-400 transition-colors">Mural RH &amp; Vendas</h4>
                <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">Versículos, curiosidades de ciência, avisos de café e cotações.</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2.5 block">Usar Modelo →</span>
            </button>
          </div>
        </div>
      </main>

      {/* 3. CREATE SCREEN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
          >
            <h3 className="text-lg font-black uppercase text-slate-100 mb-1">
              🆕 Criar Nova Tela
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Nomeie sua tela e defina um modelo inicial de widgets.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Nome da Tela
                </label>
                <input
                  type="text"
                  required
                  value={newScreenName}
                  onChange={(e) => setNewScreenName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-amber-500 outline-none rounded-xl px-4 py-2.5 text-slate-100 text-sm font-semibold transition-all"
                  placeholder="Ex: recepcao, copa, vitrine"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">
                  Modelo Inicial (Template)
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl outline-none px-3.5 h-11 text-xs font-bold text-slate-300"
                >
                  <option value="empty">Tela Vazia (Adicionar widgets manualmente)</option>
                  <option value="regional">Modelo Regional (Clima, Versículo, Notícias, Vídeo, QR Code)</option>
                  <option value="menu">Menu Lanchonete (Imagens, QR Code, Cotações)</option>
                  <option value="clinic">Recepção de Clínica (Relógio, Clima, Notícias, Avisos)</option>
                  <option value="office">Mural Corporativo (Versículo, Curiosidades, Cotações, Avisos)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewScreenName("");
                  setSelectedTemplate("empty");
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl text-xs uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs uppercase cursor-pointer"
              >
                Criar Tela
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
