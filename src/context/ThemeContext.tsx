import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/**
 * Тема оформлення (темна або світла) через Context.
 *
 * Навіщо Context, а не проп. Тему перемикає кнопка в шапці, а читає її
 * весь документ. Протягувати її пропсами через App і сторінки означало б
 * передавати значення компонентам, яким воно самим не потрібне.
 */
export type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

/*
  Осмисленого запасного значення немає: заглушка на кшталт
  `{} as ThemeContextValue` мовчки працювала б поза провайдером.
  Тому null у типі, а прибирає його перевірка в useTheme.
*/
const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";

/*
  localStorage може кинути помилку (приватне вікно, заблоковані дані сайту).
  Тема — зручність, а не дані, тож тоді просто беремо темну з макета.
*/
function readSavedTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  /*
    Тип вивівся б і сам (readSavedTheme повертає Theme), але явний
    <Theme> видно одразу, без переходу до функції.
    Функція, а не виклик: localStorage читаємо лише на першому рендері.
  */
  const [theme, setTheme] = useState<Theme>(readSavedTheme);

  /*
    Кольори задає CSS через атрибут data-theme на <html>. Це ефект,
    бо змінюємо DOM поза деревом React.
  */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Не запам'ятали: наступного разу буде темна, і це не біда.
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    [],
  );

  /*
    useMemo тримає те саме посилання на об'єкт, поки тема не змінилася.
    Новий об'єкт на кожен рендер змусив би перемальовуватися всіх, хто
    читає контекст.
  */
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  // У React 19 провайдером служить сам контекст, без .Provider.
  return <ThemeContext value={value}>{children}</ThemeContext>;
}

/** Хук-вартовий: після перевірки тип уже ThemeContextValue, без `| null`. */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error("useTheme працює лише всередині <ThemeProvider>");
  }
  return value;
}
