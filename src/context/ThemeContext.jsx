import React, { createContext, useContext, useEffect, useState } from "react";
import { fonts, palettes } from "../config/colorPalettes";

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

function applyPalette(p) {
  const root = document.documentElement;
  root.style.setProperty("--primary", p.primary);
  root.style.setProperty("--secondary", p.secondary);
  root.style.setProperty("--accent", p.accent);
  root.style.setProperty("--danger", p.danger);
  root.style.setProperty("--background", p.background);
  root.style.setProperty("--card-bg", p.cardBg);
  root.style.setProperty("--text", p.text);
  // Map some Bootstrap CSS variables and form/button colors to our palette
  root.style.setProperty("--bs-body-bg", p.background);
  root.style.setProperty("--bs-body-color", p.text);
  root.style.setProperty("--bs-card-bg", p.cardBg);
  root.style.setProperty("--bs-form-control-bg", p.cardBg);
  root.style.setProperty("--bs-form-control-color", p.text);
  root.style.setProperty("--bs-form-control-border-color", p.secondary);
  root.style.setProperty("--bs-nav-link-color", p.text);

  // compute contrasting color for buttons (black or white)
  function luminance(hex) {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16) / 255;
    const g = parseInt(c.substring(2, 4), 16) / 255;
    const b = parseInt(c.substring(4, 6), 16) / 255;
    const a = [r, g, b].map((v) =>
      v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  const lum = luminance(p.primary);
  const btnText = lum > 0.5 ? "#000000" : "#ffffff";
  root.style.setProperty("--btn-text-contrast", btnText);
  root.style.setProperty("--bs-btn-bg", p.primary);
  root.style.setProperty("--bs-btn-color", btnText);
}

export function ThemeProvider({ children }) {
  const [paletteKey, setPaletteKey] = useState("light");
  // default font set to Roboto and remove runtime changes
  const [font, setFont] = useState("Roboto");

  useEffect(() => {
    const p = palettes[paletteKey] || palettes.light;
    applyPalette(p);
    document.documentElement.style.setProperty(
      "--font-family",
      `${font}, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`
    );
  }, [paletteKey, font]);

  return (
    <ThemeContext.Provider
      value={{ paletteKey, setPaletteKey, palettes, font }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
