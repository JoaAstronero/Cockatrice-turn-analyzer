// Paletas de colores centralizadas y fuentes disponibles
export const palettes = {
  light: {
    name: "Light",
    primary: "#504234",
    secondary: "#bbbb95",
    accent: "#fc9540", // Tono principal de acento (naranja)
    // --- Colores Faltantes ---
    success: "#28a745", // Verde para 'success'
    danger: "#dc3545", // Rojo para 'danger'
    // --- Fondos ---
    background: "#f3f0ed",
    cardBg: "#ffffff", // Ligeramente más claro que background para sobresalir
    text: "#191410",
  },
  dark: {
    name: "Dark",
    primary: "#cbbdaf",
    secondary: "#6a6a44",
    accent: "#bf5803", // Tono principal de acento (naranja oscuro)
    // --- Colores Faltantes ---
    success: "#20c997", // Un verde que contrasta bien en modo oscuro
    danger: "#ff6b6b", // Un rojo que se lee bien en modo oscuro
    // --- Fondos ---
    background: "#120f0c",
    cardBg: "#0f1720", // Ligeramente más oscuro o un tono diferente al background (similar a tu 'dark' original)
    text: "#efeae6",
  },
};

export const fonts = [
  { id: "Inter", label: "Inter" },
  { id: "Roboto", label: "Roboto" },
  { id: "Segoe UI", label: "Segoe UI" },
  { id: "Arial", label: "Arial" },
];
