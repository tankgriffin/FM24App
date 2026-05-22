// Control Score — Moneyball-style possession/control ranking
// Supports Attribute mode (FM24 scouting attributes) and Stats mode (per-90 match data)

export const DEFAULT_ATTR_WEIGHTS = {
  decisionMaking: 50,
  execution: 35,
  composure: 10,
  flair: 5,
};

export const DEFAULT_STATS_WEIGHTS = {
  lossRate: 55,
  passCompletion: 30,
  passVolume: 15,
};

export const LOSS_RATE_CEILING = 0.25;

export const REQUIRED_COLUMNS = ['Name', 'Position', 'Age', 'Club'];
export const ATTR_COLUMNS = ['Vis', 'Dec', 'Pas', 'Tec', 'Fir', 'Cmp', 'Fla'];
export const STATS_COLUMNS = ['Ps A/90', 'Pas %', 'Poss Lost/90'];

// Relevant columns to strip and store (keeps localStorage footprint small)
export const RELEVANT_COLS = [
  'Name', 'Position', 'Age', 'Club', 'Nat',
  'Vis', 'Dec', 'Pas', 'Tec', 'Fir', 'Cmp', 'Fla',
  'Ps A/90', 'Pas %', 'Poss Lost/90', 'Pr passes/90',
];

// Parse a numeric cell value; '-' or unparseable → null
export function parseNum(val) {
  if (val === undefined || val === null || val === '' || val === '-') return null;
  const n = parseFloat(String(val).replace('%', '').replace(/,/g, '').trim());
  return isNaN(n) ? null : n;
}

// A player "has stats" when Ps A/90 is a parseable number > 0
export function hasStats(player) {
  const pa = parseNum(player['Ps A/90']);
  return pa !== null && pa > 0;
}

// Split FM24 position string on commas that are NOT inside parentheses
// e.g. "D (C, L), M (C)" → ["D (C, L)", "M (C)"]
function splitPositions(posStr) {
  const parts = [];
  let depth = 0;
  let current = '';
  for (const ch of posStr) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      const p = current.trim();
      if (p) parts.push(p);
      current = '';
      continue;
    }
    current += ch;
  }
  const p = current.trim();
  if (p) parts.push(p);
  return parts;
}

// True only when ALL positions are GK
export function isOnlyGK(player) {
  const parts = splitPositions(player['Position'] || '');
  return parts.length > 0 && parts.every(p => /^GK/i.test(p.trim()));
}

// Return all position groups a player belongs to
// Uses PRD tokens: GK / D / WB / DM / M / AM / ST
export function positionGroups(player) {
  const groups = new Set();
  const parts = splitPositions(player['Position'] || '');
  for (const part of parts) {
    const u = part.trim().toUpperCase();
    if (/^GK/.test(u)) { groups.add('GK'); continue; }
    if (/^ST\b/.test(u) || /^AM\b/.test(u)) { groups.add('Attacker'); continue; }
    if (/^DM\b/.test(u) || /^M\b/.test(u)) { groups.add('Midfielder'); continue; }
    if (/^WB\b/.test(u) || /^D\b/.test(u)) { groups.add('Defender'); continue; }
  }
  return [...groups];
}

function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  if (total === 0) return Object.fromEntries(Object.keys(weights).map(k => [k, 0]));
  const out = {};
  for (const k in weights) out[k] = weights[k] / total;
  return out;
}

// Attribute mode: weighted average of 7 FM24 attributes, normalised to 0–100
// PRD §4.2 formula: score = (weighted_total − 1) / 19 × 100
export function computeAttrScore(player, weights) {
  const vis = parseNum(player['Vis']);
  const dec = parseNum(player['Dec']);
  const pas = parseNum(player['Pas']);
  const tec = parseNum(player['Tec']);
  const fir = parseNum(player['Fir']);
  const cmp = parseNum(player['Cmp']);
  const fla = parseNum(player['Fla']);

  // Decision-making group — require at least one value
  const dmValues = [vis, dec].filter(v => v !== null);
  if (dmValues.length === 0) return null;
  const dmAvg = dmValues.reduce((a, b) => a + b, 0) / dmValues.length;

  const exValues = [pas, tec, fir].filter(v => v !== null);
  const exAvg = exValues.length > 0 ? exValues.reduce((a, b) => a + b, 0) / exValues.length : 0;
  const cmpAvg = cmp !== null ? cmp : 0;
  const flaAvg = fla !== null ? fla : 0;

  const norm = normalizeWeights(weights);
  const weighted =
    dmAvg * norm.decisionMaking +
    exAvg * norm.execution +
    cmpAvg * norm.composure +
    flaAvg * norm.flair;

  return Math.max(0, Math.min(100, Math.round((weighted - 1) / 19 * 100)));
}

// Stats mode: Loss Rate + Pass Completion + Pass Volume, each normalised to 0–100
// PRD §4.3
export function computeStatsScore(player, weights, maxPassesAttempted) {
  const psA = parseNum(player['Ps A/90']);
  const pasComp = parseNum(player['Pas %']);
  const possLost = parseNum(player['Poss Lost/90']);

  if (!psA || psA <= 0) return null;

  const lossRate = possLost !== null ? possLost / psA : null;

  const lossSub =
    lossRate !== null
      ? Math.max(0, Math.min(100, (1 - lossRate / LOSS_RATE_CEILING) * 100))
      : 50; // neutral fallback when Poss Lost missing

  const compSub = pasComp !== null ? Math.max(0, Math.min(100, pasComp)) : 50;

  const maxPA = maxPassesAttempted > 0 ? maxPassesAttempted : psA;
  const volSub = Math.max(0, Math.min(100, (psA / maxPA) * 100));

  const norm = normalizeWeights(weights);
  const score = Math.round(
    lossSub * norm.lossRate +
    compSub * norm.passCompletion +
    volSub * norm.passVolume,
  );

  return { score: Math.max(0, Math.min(100, score)), lossRate };
}

// Top-level scorer — auto-selects Stats or Attribute mode per PRD §4.1
export function computeControlScore(player, attrWeights, statsWeights, maxPassesAttempted) {
  if (isOnlyGK(player)) return null;

  const vis = parseNum(player['Vis']);
  const dec = parseNum(player['Dec']);
  const warnLowDecisions = (vis !== null && vis < 14) || (dec !== null && dec < 14);

  if (hasStats(player)) {
    const result = computeStatsScore(player, statsWeights, maxPassesAttempted);
    if (result !== null) {
      return { score: result.score, mode: 'STATS', lossRate: result.lossRate, warnLowDecisions };
    }
  }

  const score = computeAttrScore(player, attrWeights);
  return score !== null ? { score, mode: 'ATTR', lossRate: null, warnLowDecisions } : null;
}

// Parse FM24 HTML export → array of raw player objects
export function parseFMHtml(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = Array.from(doc.querySelectorAll('table tr'));
  if (!rows.length) return { error: 'no_table', players: [] };

  const headers = Array.from(rows[0].querySelectorAll('th')).map(th => th.textContent.trim());
  if (!headers.length) return { error: 'no_headers', players: [] };

  const players = rows.slice(1).reduce((acc, row) => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (!cells.length) return acc;
    const player = {};
    headers.forEach((h, i) => { player[h] = cells[i]?.textContent.trim() || ''; });
    if (player['Name']) acc.push(player);
    return acc;
  }, []);

  return { error: null, players };
}

// Strip a player object to only the columns we need (minimises localStorage footprint)
export function stripPlayer(player) {
  const out = {};
  for (const col of RELEVANT_COLS) {
    if (col in player) out[col] = player[col];
  }
  return out;
}

// Return list of REQUIRED + ATTR columns absent from the parsed data
export function checkMissingColumns(players) {
  if (!players.length) return [];
  const keys = new Set(Object.keys(players[0]));
  return [...REQUIRED_COLUMNS, ...ATTR_COLUMNS].filter(c => !keys.has(c));
}
