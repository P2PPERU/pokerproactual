import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const CONFIG_FILENAME = "stats_config.json";

export async function saveStatsConfig(stats: any) {
  try {
    await writeTextFile(CONFIG_FILENAME, JSON.stringify(stats, null, 2));
    return true;
  } catch (error) {
    console.error("Error guardando configuración de stats:", error);
    return false;
  }
}

export async function loadStatsConfig(): Promise<any[] | null> {
  try {
    const data = await readTextFile(CONFIG_FILENAME);
    return JSON.parse(data);
  } catch {
    // Si no existe, devuelve null (primera vez)
    return null;
  }
}


// Lista completa de stats (ajusta los nombres clave según tu backend)
export const DEFAULT_STATS = [
  { key: "vpip", label: "VPIP", checked: true, format: "VPIP:{value}" },
  { key: "pfr", label: "PFR", checked: true, format: "PFR:{value}" },
  { key: "three_bet", label: "3-Bet", checked: true, format: "3B:{value}" },
  { key: "fold_to_3bet_pct", label: "Fold to 3-Bet", checked: true, format: "F3B:{value}" },
  { key: "four_bet", label: "4-Bet", checked: false, format: "4B:{value}" },
  { key: "fold_to_4bet", label: "Fold to 4-Bet", checked: false, format: "F4B:{value}" },
  { key: "cbet_flop", label: "CBet Flop", checked: false, format: "CBF:{value}" },
  { key: "cbet_turn", label: "CBet Turn", checked: false, format: "CBT:{value}" },
  { key: "fold_to_cbet_flop", label: "Fold to Flop CB", checked: false, format: "FCBF:{value}" },
  { key: "fold_to_cbet_turn", label: "Fold to Turn CB", checked: false, format: "FCBT:{value}" },
  { key: "probe_bet_turn", label: "Probe Bet Turn", checked: false, format: "PBT:{value}" },
  { key: "bet_river_pct", label: "Bet River %", checked: false, format: "BR:{value}" },
  { key: "overbet_turn_pct", label: "Overbet Turn %", checked: false, format: "OBT:{value}" },
  { key: "overbet_river_pct", label: "Overbet River %", checked: false, format: "OBR:{value}" },
  { key: "wwsf", label: "WWSF", checked: false, format: "WWSF:{value}" },
  { key: "wtsd", label: "WTSD", checked: false, format: "WTSD:{value}" },
  { key: "wsd", label: "WSD", checked: false, format: "WSD:{value}" },
  { key: "wsdwbr", label: "WSDwBR", checked: false, format: "WSDwBR:{value}" },
  { key: "limp_pct", label: "Limp %", checked: false, format: "LIMP:{value}" },
  { key: "limp_raise_pct", label: "Limp-Raise %", checked: false, format: "LIMP-R:{value}" },
  // Puedes agregar/quitar stats según tu backend
];
