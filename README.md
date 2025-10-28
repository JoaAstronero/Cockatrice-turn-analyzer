# Tontis — Turn Analyzer (SPA)

Proyecto inicial: SPA con React + Vite para pegar logs y calcular estadísticas de turnos por jugador.

Principales características:

- Bibliotecas: React, Vite, Bootstrap, Chart.js (react-chartjs-2)
- Módulo `src/lib/turns.js` con la lógica de parsing y cálculo exportada (ESM) para uso en frontend o backend.

Cómo usar localmente:

1. Instalar dependencias:

```powershell
npm install
```

2. Levantar servidor de desarrollo:

```powershell
npm run dev
```

3. Abrir en el navegador la URL que indique Vite (normalmente http://localhost:5173)

Siguientes mejoras:

- Soporte para subir archivos en lugar de pegar
- Guardado de partidas (mini fullstack con SQLite + Express)
- Tests unitarios para `src/lib/turns.js`
