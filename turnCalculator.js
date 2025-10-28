// ====================================================
// CONFIGURACIÓN
// ====================================================
const fs = require("fs");
const path = require("path");
const MIN_TURN_DURATION = 2; // segundos mínimos para considerar un turno válido
const LOG_PATH = path.join(__dirname, "log.txt"); // archivo opcional en la misma carpeta

// ====================================================
// UTILIDADES (con cabeceras)
// ====================================================
/**
 * parseTime - Extrae segundos desde la medianoche a partir de una etiqueta [HH:MM:SS]
 * @param {string} str - Línea de log que contiene la hora en formato [HH:MM:SS]
 * @returns {number} Segundos transcurridos desde la medianoche (0..86399)
 */
function parseTime(str) {
  const m = str.match(/\[(\d+):(\d+):(\d+)\]/);
  if (!m) return NaN;
  const [, h, mm, s] = m;
  return Number(h) * 3600 + Number(mm) * 60 + Number(s);
}

/**
 * formatTime - Formatea segundos a mm:ss.SS
 * @param {number} seconds
 * @returns {string}
 */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(2);
  return `${m.toString().padStart(2, "0")}:${s.padStart(5, "0")}`;
}

/**
 * getDefaultLog - Provee un log de ejemplo si no hay archivo físico
 * @returns {string}
 */
function getDefaultLog() {
  return `[00:34:07] AmeisingEO sets counter Life to 6 (-8).
[00:34:13] Astronero moves Worst Fears from the stack to their hand.
[00:34:14] AmeisingEO moves Swamp from the stack to their hand.
[00:34:17] AmeisingEO's turn.
[00:34:19] AmeisingEO untaps their permanents.
[00:34:21] Astronero has conceded the game.`;
}

/**
 * loadLog - Lee el archivo log si existe o devuelve el ejemplo.
 * @param {string} filePath
 * @returns {string}
 */
function loadLog(filePath) {
  if (fs.existsSync(filePath)) {
    console.log("================================");
    console.log(` Leyendo archivo: ${filePath}`);
    console.log("================================\n");
    return fs.readFileSync(filePath, "utf8");
  }

  console.log("================================");
  console.log(" No se encontró 'log.txt', usando variable 'log' en el código.");
  console.log("================================\n");
  return getDefaultLog();
}

/**
 * parseLines - Convierte el texto completo del log en un arreglo de objetos {time, text, raw}
 * Filtra líneas sin timestamp y normaliza la hora a segundos.
 * @param {string} rawLog
 * @returns {{time:number,text:string,raw:string}[]}
 */
function parseLines(rawLog) {
  return rawLog
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((raw) => {
      const m = raw.match(/^\[(\d{1,2}):(\d{2}):(\d{2})\]\s*(.*)$/);
      if (!m) return null;
      const [, h, mm, s, rest] = m;
      return {
        time: Number(h) * 3600 + Number(mm) * 60 + Number(s),
        text: rest,
        raw,
      };
    })
    .filter(Boolean);
}

/**
 * extractTurns - Extrae los turnos (start/end/duration/player) a partir de líneas parseadas
 * Maneja cruce de medianoche y filtra turnos por MIN_TURN_DURATION.
 * @param {{time:number,text:string,raw:string}[]} parsedLines
 * @returns {{turns:object[], ignored:number}}
 */
function extractTurns(parsedLines) {
  const turns = [];
  let currentTurn = null;
  let ignoredTurns = 0;

  for (const entry of parsedLines) {
    const turnMatch = entry.text.match(/^(.+?)'s turn\.?$/);
    if (turnMatch) {
      // cerrar turno previo
      if (currentTurn) {
        currentTurn.end = entry.time;
        if (currentTurn.end < currentTurn.start) currentTurn.end += 24 * 3600; // cruce de día
        currentTurn.duration = currentTurn.end - currentTurn.start;

        if (currentTurn.duration >= MIN_TURN_DURATION) {
          turns.push(currentTurn);
          console.log(
            `| Turno cerrado: ${currentTurn.player} (${formatTime(
              currentTurn.duration
            )})`
          );
        } else {
          ignoredTurns++;
          console.log(
            `| Turno ignorado (${
              currentTurn.player
            }) -> ${currentTurn.duration.toFixed(2)}s < ${MIN_TURN_DURATION}s`
          );
        }
      }

      currentTurn = { player: turnMatch[1], start: entry.time, end: null };
      console.log(`> Nuevo turno: ${currentTurn.player} (${entry.time}s)`);
    }
  }

  // cerrar último turno usando la última línea con timestamp
  if (currentTurn) {
    const last = parsedLines[parsedLines.length - 1];
    currentTurn.end = last.time;
    if (currentTurn.end < currentTurn.start) currentTurn.end += 24 * 3600;
    currentTurn.duration = currentTurn.end - currentTurn.start;

    if (currentTurn.duration >= MIN_TURN_DURATION) {
      turns.push(currentTurn);
      console.log(
        `| Último turno cerrado: ${currentTurn.player} (${formatTime(
          currentTurn.duration
        )})`
      );
    } else {
      ignoredTurns++;
      console.log(
        `| Último turno ignorado (${
          currentTurn.player
        }) -> ${currentTurn.duration.toFixed(2)}s < ${MIN_TURN_DURATION}s`
      );
    }
  }

  return { turns, ignored: ignoredTurns };
}

/**
 * computeStats - Calcula estadísticas por jugador y globales
 * @param {{player:string,start:number,end:number,duration:number}[]} turns
 * @returns {{byPlayer:object, global:{avg:number,longest:number,shortest:number,moreThanAvg:number,lessThanAvg:number}}}
 */
function computeStats(turns) {
  const stats = {};
  for (const t of turns) {
    if (!stats[t.player]) stats[t.player] = [];
    stats[t.player].push(t.duration);
  }

  let allDurations = [];
  for (const p in stats) allDurations = allDurations.concat(stats[p]);

  const globalAvg =
    allDurations.reduce((a, b) => a + b, 0) / (allDurations.length || 1);

  const byPlayer = {};
  for (const p in stats) {
    const durations = stats[p];
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    byPlayer[p] = {
      count: durations.length,
      avg,
      min: Math.min(...durations),
      max: Math.max(...durations),
      aboveGlobal: durations.filter((d) => d > globalAvg).length,
      belowGlobal: durations.filter((d) => d < globalAvg).length,
    };
  }

  const longest = Math.max(...allDurations);
  const shortest = Math.min(...allDurations);
  const longerThanAvg = allDurations.filter((d) => d > globalAvg).length;
  const shorterThanAvg = allDurations.filter((d) => d < globalAvg).length;

  return {
    byPlayer,
    global: {
      avg: globalAvg,
      longest,
      shortest,
      moreThanAvg: longerThanAvg,
      lessThanAvg: shorterThanAvg,
    },
  };
}

/**
 * printStats - Imprime estadísticas en consola (en español)
 * @param {*} statsObj
 * @param {number} ignoredTurns
 */
function printStats(statsObj, ignoredTurns) {
  const { byPlayer, global } = statsObj;

  if (Object.keys(byPlayer).length === 0) {
    console.log("\n--------------------------------");
    console.log("No hay turnos válidos según el filtro.");
    console.log("--------------------------------");
    return;
  }

  console.log("\n================================");
  console.log("  ESTADÍSTICAS POR JUGADOR");
  console.log("================================");

  for (const player in byPlayer) {
    const p = byPlayer[player];
    console.log(`\nJugador: ${player}`);
    console.log(`  Turnos:             ${p.count}`);
    console.log(`  Promedio:           ${formatTime(p.avg)}`);
    console.log(`  Más corto:          ${formatTime(p.min)}`);
    console.log(`  Más largo:          ${formatTime(p.max)}`);
    console.log(`  > Promedio global:  ${p.aboveGlobal}`);
    console.log(`  < Promedio global:  ${p.belowGlobal}`);
  }

  console.log("\n================================");
  console.log("  ESTADÍSTICAS GLOBALES");
  console.log("================================");
  console.log(`  Promedio global:           ${formatTime(global.avg)}`);
  console.log(`  Turno más largo:           ${formatTime(global.longest)}`);
  console.log(`  Turno más corto:           ${formatTime(global.shortest)}`);
  console.log(`  Turnos > promedio global:  ${global.moreThanAvg}`);
  console.log(`  Turnos < promedio global:  ${global.lessThanAvg}`);
  console.log(`  Turnos ignorados (<${MIN_TURN_DURATION}s): ${ignoredTurns}`);
  console.log("--------------------------------");
}

// ====================================================
// FLUJO PRINCIPAL
// ====================================================
const rawLog = loadLog(LOG_PATH);
const parsedLines = parseLines(rawLog);
const { turns, ignored } = extractTurns(parsedLines);
const statsObj = computeStats(turns);
printStats(statsObj, ignored);
