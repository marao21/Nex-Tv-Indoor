export enum WidgetType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  CLOCK = "CLOCK",
  WEATHER = "WEATHER",
  STOCKS = "STOCKS",
  TEXT = "TEXT",
  QRCODE = "QRCODE",
  COUNTDOWN = "COUNTDOWN",
  NEWS = "NEWS",
  LOTTERY = "LOTTERY",
  VERSE = "VERSE",
  TRIVIA = "TRIVIA"
}

export interface WidgetItem {
  id: string;
  type: WidgetType;
  title: string;
  duration: number; // in seconds
  active: boolean;
  config: {
    url?: string;
    city?: string;
    newsCategory?: string;
    tickerText?: string;
    textColor?: string;
    bgColor?: string;
    fontSize?: string; // 'sm' | 'md' | 'lg' | 'xl'
    countdownDate?: string;
    countdownLabel?: string;
    qrUrl?: string;
    qrTitle?: string;
    qrDesc?: string;
    clockStyle?: "digital" | "analog" | "both";
    clockTimezone?: string;
    triviaTopic?: string;
    bibleTopic?: string;
    items?: any[]; // generated items
  };
}

export interface Screen {
  id: string;
  name: string;
  description: string;
  orientation: "horizontal" | "vertical";
  tvRotation?: "none" | "90" | "-90";
  splitScreen: boolean;
  showNewsTicker: boolean;
  updatedAt: string;
  status: "online" | "offline";
  items: WidgetItem[];
}
