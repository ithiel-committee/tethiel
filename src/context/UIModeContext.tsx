import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { UI_TEXTS, type UIMode, type UITextKey } from "../data/uiTexts";

const STORAGE_KEY = "tethiel_ui_mode";

interface UIModeContextType {
  mode: UIMode;
  isKids: boolean;
  setMode: (mode: UIMode) => void;
  toggleMode: () => void;
  t: (key: UITextKey) => string;
}

const UIModeContext = createContext<UIModeContextType | null>(null);

export function UIModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<UIMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "kids" || saved === "standard") {
        return saved;
      }
    } catch {
      // LocalStorageアクセス不可時はフォールバック
    }
    return "standard";
  });

  const setMode = useCallback((newMode: UIMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // 無視
    }
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "kids" ? "standard" : "kids";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // 無視
      }
      return next;
    });
  }, []);

  const t = useCallback(
    (key: UITextKey): string => {
      const entry = UI_TEXTS[key];
      if (!entry) return key;
      return entry[mode] ?? entry.standard;
    },
    [mode],
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-ui-mode", mode);
  }, [mode]);

  const value: UIModeContextType = {
    mode,
    isKids: mode === "kids",
    setMode,
    toggleMode,
    t,
  };

  return (
    <UIModeContext.Provider value={value}>{children}</UIModeContext.Provider>
  );
}

export function useUIText(): UIModeContextType {
  const context = useContext(UIModeContext);
  if (!context) {
    // Providerの外で呼ばれた場合のフォールバック
    return {
      mode: "standard",
      isKids: false,
      setMode: () => {},
      toggleMode: () => {},
      t: (key: UITextKey) => UI_TEXTS[key]?.standard ?? key,
    };
  }
  return context;
}
