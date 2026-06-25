/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Screen, WidgetItem, WidgetType } from "./types";
import { DEFAULT_SCREENS, PRESET_IMAGES } from "./data";
import AdminPanel from "./components/AdminPanel";
import ScreenConfigurator from "./components/ScreenConfigurator";
import TVPlayer from "./components/TVPlayer";

export default function App() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);
  const [tvId, setTvId] = useState<string | null>(null);

  // Initialize and load screens from localStorage
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tvParam = queryParams.get("tv");
    if (tvParam) {
      setTvId(tvParam);
    }

    const saved = localStorage.getItem("vtx_indoor_screens");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setScreens(parsed);

        // If in TV Player view, keep selected screen synchronized
        if (tvParam) {
          const matched = parsed.find((s: Screen) => s.id === tvParam);
          if (matched) setSelectedScreen(matched);
        }
      } catch (e) {
        setScreens(DEFAULT_SCREENS);
        localStorage.setItem("vtx_indoor_screens", JSON.stringify(DEFAULT_SCREENS));
      }
    } else {
      setScreens(DEFAULT_SCREENS);
      localStorage.setItem("vtx_indoor_screens", JSON.stringify(DEFAULT_SCREENS));
    }
  }, []);

  // Listen to storage changes in real-time (for other tabs like TV Player)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "vtx_indoor_screens" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setScreens(parsed);

          // Update current TV player settings instantly!
          const currentTvParam = new URLSearchParams(window.location.search).get("tv");
          if (currentTvParam) {
            const matched = parsed.find((s: Screen) => s.id === currentTvParam);
            if (matched) setSelectedScreen(matched);
          }
        } catch (err) {}
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Save screen list
  const handleSaveScreensList = (updatedList: Screen[]) => {
    setScreens(updatedList);
    localStorage.setItem("vtx_indoor_screens", JSON.stringify(updatedList));
  };

  // Create Screen
  const handleCreateScreen = (name: string, template = "empty") => {
    let initialItems: WidgetItem[] = [];

    if (template === "regional") {
      initialItems = [...DEFAULT_SCREENS[0].items];
    } else if (template === "menu") {
      initialItems = [
        {
          id: "w-menu-1",
          type: WidgetType.IMAGE,
          title: "Menu Promo Burger",
          duration: 10,
          active: true,
          config: { url: PRESET_IMAGES[0].url }
        },
        {
          id: "w-menu-2",
          type: WidgetType.QRCODE,
          title: "Fazer Pedido",
          duration: 10,
          active: true,
          config: { qrUrl: "https://vtxburger.com", qrTitle: "Peça pelo Celular", qrDesc: "Escaneie o código QR para abrir nosso cardápio e pedir diretamente de sua mesa!" }
        },
        {
          id: "w-menu-3",
          type: WidgetType.STOCKS,
          title: "Cotações do Dia",
          duration: 10,
          active: true,
          config: {}
        },
        {
          id: "w-menu-4",
          type: WidgetType.WEATHER,
          title: "Clima Local",
          duration: 10,
          active: true,
          config: { city: "Teixeira de Freitas" }
        }
      ];
    } else if (template === "clinic") {
      initialItems = [
        {
          id: "w-clinic-1",
          type: WidgetType.CLOCK,
          title: "Hora Certa",
          duration: 10,
          active: true,
          config: { clockStyle: "digital" }
        },
        {
          id: "w-clinic-2",
          type: WidgetType.WEATHER,
          title: "Temperatura",
          duration: 10,
          active: true,
          config: { city: "Teixeira de Freitas" }
        },
        {
          id: "w-clinic-3",
          type: WidgetType.NEWS,
          title: "Notícias Gerais",
          duration: 10,
          active: true,
          config: { newsCategory: "geral" }
        },
        {
          id: "w-clinic-4",
          type: WidgetType.TEXT,
          title: "Aviso de Saúde",
          duration: 10,
          active: true,
          config: { tickerText: "Higienize suas mãos regularmente com álcool em gel disponível nos totens. Cuide de você e de quem você ama!", textColor: "#ffffff", bgColor: "#0284c7", fontSize: "md" }
        }
      ];
    } else if (template === "office") {
      initialItems = [
        {
          id: "w-office-1",
          type: WidgetType.VERSE,
          title: "Palavra de Fé",
          duration: 10,
          active: true,
          config: { bibleTopic: "Fé", textColor: "#ffffff", bgColor: "#1e1b4b" }
        },
        {
          id: "w-office-2",
          type: WidgetType.TRIVIA,
          title: "Fatos Fascinantes",
          duration: 10,
          active: true,
          config: { triviaTopic: "Espaço", textColor: "#ffffff", bgColor: "#124e3f" }
        },
        {
          id: "w-office-3",
          type: WidgetType.STOCKS,
          title: "Indicadores de Mercado",
          duration: 10,
          active: true,
          config: {}
        },
        {
          id: "w-office-4",
          type: WidgetType.TEXT,
          title: "Pausa para Café",
          duration: 10,
          active: true,
          config: { tickerText: "Café fresco acabou de ser preparado na copa do RH! Venha se abastecer.", textColor: "#ffffff", bgColor: "#9a3412", fontSize: "md" }
        }
      ];
    }

    const newScreen: Screen = {
      id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4),
      name,
      description: `Tela configurada como modelo: ${template}`,
      orientation: "horizontal",
      splitScreen: template !== "empty",
      showNewsTicker: template !== "empty",
      updatedAt: new Date().toISOString(),
      status: "offline",
      items: initialItems
    };

    const updatedList = [...screens, newScreen];
    handleSaveScreensList(updatedList);
  };

  // Delete Screen
  const handleDeleteScreen = (id: string) => {
    const updatedList = screens.filter((screen) => screen.id !== id);
    handleSaveScreensList(updatedList);
  };

  // Save specific screen changes from ScreenConfigurator
  const handleSaveScreen = (updatedScreen: Screen) => {
    const updatedList = screens.map((screen) =>
      screen.id === updatedScreen.id ? updatedScreen : screen
    );
    handleSaveScreensList(updatedList);
    setSelectedScreen(updatedScreen);
  };

  // Exit TV Player
  const handleClosePlayer = () => {
    // Clear query parameter
    window.location.search = "";
  };

  // 1. TV PLAYER VIEW ROUTE
  if (tvId) {
    const currentTvScreen = screens.find((screen) => screen.id === tvId);
    if (currentTvScreen) {
      return <TVPlayer screen={currentTvScreen} onClose={handleClosePlayer} />;
    }
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center font-sans p-6">
        <p className="text-xl font-bold text-rose-500">Erro: Tela não encontrada</p>
        <p className="text-sm text-slate-500 mt-2">O código de tela "{tvId}" é inválido ou foi excluído.</p>
        <button
          onClick={handleClosePlayer}
          className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold cursor-pointer"
        >
          Voltar para o Painel
        </button>
      </div>
    );
  }

  // 2. SCREEN CONFIGURATOR VIEW ROUTE
  if (selectedScreen) {
    return (
      <ScreenConfigurator
        screen={selectedScreen}
        onBack={() => setSelectedScreen(null)}
        onSave={handleSaveScreen}
      />
    );
  }

  // 3. ADMIN PANEL DASHBOARD ROUTE (DEFAULT)
  return (
    <AdminPanel
      screens={screens}
      onSelectScreen={setSelectedScreen}
      onCreateScreen={handleCreateScreen}
      onDeleteScreen={handleDeleteScreen}
    />
  );
}

