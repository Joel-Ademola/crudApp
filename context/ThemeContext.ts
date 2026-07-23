import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { Colors } from "../constants/theme";

type Theme = typeof Colors.light;

interface ThemeContextType {
  colorScheme: ColorSchemeName;
  setColorScheme: React.Dispatch<React.SetStateAction<ColorSchemeName>>;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  return React.createElement(
    ThemeContext.Provider,
    { value: { colorScheme, setColorScheme, theme } },
    children,
  );
};

// 👇 Custom hook
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
