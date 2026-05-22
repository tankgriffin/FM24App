import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Upload, Search, X, Settings, AlertTriangle,
  ChevronDown, ChevronUp, RotateCcw,
} from 'lucide-react';
import {
  parseNum, isOnlyGK, positionGroups, hasStats,
  computeControlScore, computeAttrScore, computeStatsScore,
  DEFAULT_ATTR_WEIGHTS, DEFAULT_STATS_WEIGHTS,
  REQUIRED_COLUMNS, ATTR_COLUMNS,
  parseFMHtml, stripPlayer, checkMissingColumns,
} from '../utils/controlScore';

const LS_PLAYERS = 'fm24_control_players';
const LS_ATTR_W  = 'fm24_control_attr_weights';
const LS_STATS_W = 'fm24_control_stats_weights';

// ─── helpers ────────────────────────────────────────────────────────────────

function normalizeWeights(w) {
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  if (total === 0) return Object.fromEntries(Object.keys(w).map(k => [k, 0]));
  const out = {};
  for (const k in w) out[k] = w[k] / total;
  return out;
}

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota or unavailable */ }
}

// ─── sub-components ─────────────────────────────────────────────────────────

const ScorePill = ({ score }) => {
  const cls =
    score >= 65
      ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 ring-1 ring-green-300 dark:ring-green-700'
      : score >= 50
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700'
      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-300 dark:ring-red-700';
  return (
    <span className={`inline-flex items-center justify-center w-12 h-7 rounded-full text-sm font-bold ${cls}`}>
      {score}
    </span>
  );
};

const ModeTag = ({ mode }) => (
  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${
    mode === 'STATS'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }`}>
    {mode}
  </span>
);

// Clickable sortable <th>
const SortTh = ({ col, label, sortCol, sortDir, onSort, align = 'left', className = '' }) => (
  <th
    onClick={() => onSort(col)}
    className={`px-3 py-3 font-semibold whitespace-nowrap cursor-pointer select-none transition-colors
      text-${align}
      ${sortCol === col
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}
      ${className}`}
  >
    <span className="inline-flex items-center gap-1">
      {label}
      {sortCol === col && <span className="text-xs opacity-70">{sortDir === 'asc' ? '↑' : '↓'}</span>}
    </span>
  </th>
);

const ATTR_W_LABELS = {
  decisionMaking: 'Decision-making (Vision, Decisions)',
  execution: 'Execution (Passing, Technique, First Touch)',
  composure: 'Composure',
  flair: 'Flair',
};

const STATS_W_LABELS = {
  lossRate: 'Loss Rate (lower = better)',
  passCompletion: 'Pass Completion %',
  passVolume: 'Pass Volume / 90',
};

const WeightsPanel = ({ attrWeights, statsWeights, onChange, onReset }) => {
  const attrNorm  = normalizeWeights(attrWeights);
  const statsNorm = normalizeWeights(statsWeights);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Score Weights</h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset to defaults
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attribute mode */}
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Attribute Mode
          </p>
          <div className="space-y-3">
            {Object.entries(attrWeights).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{ATTR_W_LABELS[key]}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round(attrNorm[key] * 100)}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" value={val}
                  className="w-full h-1.5 accent-primary-600 cursor-pointer"
                  onChange={e => onChange('attr', key, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Stats mode */}
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Stats Mode
          </p>
          <div className="space-y-3">
            {Object.entries(statsWeights).map(([key, val]) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>{STATS_W_LABELS[key]}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round(statsNorm[key] * 100)}%
                  </span>
                </div>
                <input
                  type="range" min="0" max="100" value={val}
                  className="w-full h-1.5 accent-primary-600 cursor-pointer"
                  onChange={e => onChange('stats', key, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── main component ──────────────────────────────────────────────────────────

const ControlScore = () => {
  const [players,     setPlayers]     = useState([]);
  const [isDragging,  setIsDragging]  = useState(false);
  const [parseError,  setParseError]  = useState(null);   // 'no_table' | 'no_headers' | null
  const [missingCols, setMissingCols] = useState([]);
  const [showWeights, setShowWeights] = useState(false);

  // Filters
  const [search,     setSearch]     = useState('');
  const [posFilter,  setPosFilter]  = useState('All');
  const [modeFilter, setModeFilter] = useState('All');
  const [minScore,   setMinScore]   = useState('');

  // Sort
  const [sortCol, setSortCol] = useState('score');
  const [sortDir, setSortDir] = useState('desc');

  // Weights stored as raw values (0–100 each); normalised for computation & display
  const [attrWeights,  setAttrWeights]  = useState(DEFAULT_ATTR_WEIGHTS);
  const [statsWeights, setStatsWeights] = useState(DEFAULT_STATS_WEIGHTS);

  // ── persistence: load on mount ──
  useEffect(() => {
    const stored = lsGet(LS_PLAYERS, []);
    if (stored.length) setPlayers(stored);
    setAttrWeights(lsGet(LS_ATTR_W,  DEFAULT_ATTR_WEIGHTS));
    setStatsWeights(lsGet(LS_STATS_W, DEFAULT_STATS_WEIGHTS));
  }, []);

  useEffect(() => { if (players.length) lsSet(LS_PLAYERS, players); }, [players]);
  useEffect(() => { lsSet(LS_ATTR_W,  attrWeights);  }, [attrWeights]);
  useEffect(() => { lsSet(LS_STATS_W, statsWeights); }, [statsWeights]);

  // ── file handling ──
  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const { error, players: parsed } = parseFMHtml(e.target.result);
      if (error) { setParseError(error); return; }
      const missing = checkMissingColumns(parsed);
      setMissingCols(missing);
      setParseError(null);
      setPlayers(parsed.map(stripPlayer));
    };
    reader.readAsText(file);
  }, []);

  const handleClear = useCallback(() => {
    setPlayers([]);
    setParseError(null);
    setMissingCols([]);
    try { localStorage.removeItem(LS_PLAYERS); } catch { /* ignore */ }
  }, []);

  // ── weight handlers ──
  const handleWeightChange = useCallback((mode, key, value) => {
    if (mode === 'attr')  setAttrWeights(prev  => ({ ...prev,  [key]: value }));
    else                  setStatsWeights(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleResetWeights = useCallback(() => {
    setAttrWeights(DEFAULT_ATTR_WEIGHTS);
    setStatsWeights(DEFAULT_STATS_WEIGHTS);
  }, []);

  // ── sort handler ──
  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  // ── normalised weights (memoised so scoring doesn't recompute unnecessarily) ──
  const normAttr  = useMemo(() => normalizeWeights(attrWeights),  [attrWeights]);
  const normStats = useMemo(() => normalizeWeights(statsWeights), [statsWeights]);

  // ── max passes attempted across dataset (for volume sub-score) ──
  const maxPassesAttempted = useMemo(() => {
    let max = 0;
    for (const p of players) {
      const pa = parseNum(p['Ps A/90']);
      if (pa && pa > max) max = pa;
    }
    return max;
  }, [players]);

  // ── score all players ──
  const { scored, gkCount } = useMemo(() => {
    let gkCount = 0;
    const scored = [];
    for (const p of players) {
      if (isOnlyGK(p)) { gkCount++; continue; }
      const ctrl = computeControlScore(p, normAttr, normStats, maxPassesAttempted);
      if (ctrl !== null) scored.push({ ...p, _ctrl: ctrl });
    }
    return { scored, gkCount };
  }, [players, normAttr, normStats, maxPassesAttempted]);

  // Optional progressive passes column
  const hasPrPasses = useMemo(
    () => players.length > 0 && 'Pr passes/90' in players[0],
    [players],
  );

  // ── apply filters + sort ──
  const displayed = useMemo(() => {
    let result = scored.filter(p => {
      if (search && !p['Name']?.toLowerCase().includes(search.toLowerCase())) return false;
      if (posFilter !== 'All' && !positionGroups(p).includes(posFilter)) return false;
      if (modeFilter !== 'All' && p._ctrl.mode !== modeFilter) return false;
      const min = Number(minScore);
      if (minScore !== '' && p._ctrl.score < min) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      let av, bv;
      switch (sortCol) {
        case 'score': av = a._ctrl.score; bv = b._ctrl.score; break;
        case 'name':  av = a['Name']  || ''; bv = b['Name']  || ''; break;
        case 'age':   av = Number(a['Age']) || 0; bv = Number(b['Age']) || 0; break;
        case 'club':  av = a['Club']  || ''; bv = b['Club']  || ''; break;
        case 'mode':  av = a._ctrl.mode;    bv = b._ctrl.mode;    break;
        default:      av = a._ctrl.score;   bv = b._ctrl.score;
      }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return result;
  }, [scored, search, posFilter, modeFilter, minScore, sortCol, sortDir]);

  // ════════════════════════════════════════════════════════════════════════════
  // EMPTY STATE — no data loaded
  // ════════════════════════════════════════════════════════════════════════════
  if (players.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Control Score</h1>

        {parseError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              {parseError === 'no_table' || parseError === 'no_headers'
                ? 'Could not read the file. Make sure it is an FM24 HTML player export with a header row.'
                : 'Unexpected error reading file.'}
            </span>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-xl p-16 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          }`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Upload FM24 Player Export
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
            Export your squad or scouting list as HTML from FM24 and upload it here.
          </p>
          <div className="text-xs text-gray-400 dark:text-gray-500 mb-6 space-y-1.5">
            <p className="font-semibold text-gray-500 dark:text-gray-400">Required columns in your export view:</p>
            <p>
              <span className="font-mono">Name · Position · Age · Club</span>
            </p>
            <p>
              <span className="font-mono">Vis · Dec · Pas · Tec · Fir · Cmp · Fla</span>
              {' '}(attributes — always needed)
            </p>
            <p className="text-gray-300 dark:text-gray-600">
              <span className="font-mono">Ps A/90 · Pas % · Poss Lost/90</span>
              {' '}(optional — enables Stats mode once players have match data)
            </p>
          </div>
          <label className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg transition-colors text-sm font-medium">
            Browse File
            <input
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </label>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // LOADED STATE — ranked table
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-4">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Control Score</h1>
          {gkCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {gkCount} goalkeeper{gkCount !== 1 ? 's' : ''} excluded
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {displayed.length} / {scored.length} players
          </span>

          {/* Re-upload button */}
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> Re-upload
            <input
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={e => handleFile(e.target.files[0])}
            />
          </label>

          <button
            onClick={() => setShowWeights(w => !w)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Weights
            {showWeights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500 transition-colors"
          >
            <X className="w-4 h-4" /> Clear data
          </button>
        </div>
      </div>

      {/* ── Missing columns warning ── */}
      {missingCols.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Columns not found in export:{' '}
            <span className="font-mono">{missingCols.join(', ')}</span>.
            Players missing attribute data will score lower or be omitted.
          </span>
        </div>
      )}

      {/* ── Weights panel ── */}
      {showWeights && (
        <WeightsPanel
          attrWeights={attrWeights}
          statsWeights={statsWeights}
          onChange={handleWeightChange}
          onReset={handleResetWeights}
        />
      )}

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-green-400" /> ≥ 65 — suits a control system
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-amber-400" /> 50–64 — usable, not a strength
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-red-400" /> &lt; 50 — weak link
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-500" /> low Vision or Decisions (&lt; 14)
        </span>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-44">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        <select
          value={posFilter}
          onChange={e => setPosFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="All">All Positions</option>
          <option value="Defender">Defender</option>
          <option value="Midfielder">Midfielder</option>
          <option value="Attacker">Attacker</option>
          <option value="GK">GK (incl. hybrid)</option>
        </select>

        <select
          value={modeFilter}
          onChange={e => setModeFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="All">All modes</option>
          <option value="STATS">Stats only</option>
          <option value="ATTR">Attribute only</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Min score</span>
          <input
            type="number"
            min="0" max="100"
            value={minScore}
            onChange={e => setMinScore(e.target.value)}
            placeholder="0"
            className="w-16 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {(search || posFilter !== 'All' || modeFilter !== 'All' || minScore !== '') && (
          <button
            onClick={() => { setSearch(''); setPosFilter('All'); setModeFilter('All'); setMinScore(''); }}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-3 py-3 text-center w-10 font-semibold text-gray-500 dark:text-gray-400 text-xs">#</th>
                <SortTh col="name"  label="Name"          sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Pos</th>
                <SortTh col="age"   label="Age"           sortCol={sortCol} sortDir={sortDir} onSort={handleSort} align="center" />
                <SortTh col="club"  label="Club"          sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                <SortTh col="mode"  label="Mode"          sortCol={sortCol} sortDir={sortDir} onSort={handleSort} align="center" />
                <SortTh col="score" label="Control Score" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} align="center" />
                <th className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  Key Inputs
                </th>
                {hasPrPasses && (
                  <th className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap text-xs">
                    Pr Pass/90
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {displayed.map((player, i) => {
                const { score, mode, lossRate, warnLowDecisions } = player._ctrl;
                const pasPct = parseNum(player['Pas %']);

                return (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    {/* Rank */}
                    <td className="px-3 py-3 text-center text-xs text-gray-400 dark:text-gray-500 font-mono">
                      {i + 1}
                    </td>

                    {/* Name + warning */}
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        {player['Name']}
                        {warnLowDecisions && mode === 'ATTR' && (
                          <AlertTriangle
                            className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0"
                            title="Low decision-making for a control system (Vision or Decisions < 14)"
                          />
                        )}
                      </span>
                    </td>

                    {/* Position */}
                    <td
                      className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-36 truncate"
                      title={player['Position']}
                    >
                      {player['Position']}
                    </td>

                    {/* Age */}
                    <td className="px-3 py-3 text-gray-700 dark:text-gray-300 text-center">
                      {player['Age']}
                    </td>

                    {/* Club */}
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {player['Club']}
                    </td>

                    {/* Mode tag */}
                    <td className="px-3 py-3 text-center">
                      <ModeTag mode={mode} />
                    </td>

                    {/* Score pill */}
                    <td className="px-3 py-3 text-center">
                      <ScorePill score={score} />
                    </td>

                    {/* Key inputs — mode-dependent */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      {mode === 'ATTR' ? (
                        <span className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            Vis <b className={`${parseNum(player['Vis']) !== null && parseNum(player['Vis']) < 14 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                              {player['Vis'] || '—'}
                            </b>
                          </span>
                          <span>
                            Dec <b className={`${parseNum(player['Dec']) !== null && parseNum(player['Dec']) < 14 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                              {player['Dec'] || '—'}
                            </b>
                          </span>
                          <span>
                            Pas <b className="text-gray-900 dark:text-white">{player['Pas'] || '—'}</b>
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {lossRate !== null && (
                            <span title="Possession Loss Rate">
                              Loss{' '}
                              <b className={
                                lossRate < 0.10 ? 'text-green-600 dark:text-green-400' :
                                lossRate < 0.15 ? 'text-amber-600 dark:text-amber-400' :
                                                  'text-red-600 dark:text-red-400'
                              }>
                                {(lossRate * 100).toFixed(1)}%
                              </b>
                            </span>
                          )}
                          {pasPct !== null && (
                            <span title="Pass Completion %">
                              Pass%{' '}
                              <b className="text-gray-900 dark:text-white">
                                {pasPct.toFixed(1)}%
                              </b>
                            </span>
                          )}
                        </span>
                      )}
                    </td>

                    {/* Optional: Progressive Passes */}
                    {hasPrPasses && (
                      <td className="px-3 py-3 text-center text-xs text-gray-600 dark:text-gray-400">
                        {player['Pr passes/90'] || '—'}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {displayed.length === 0 && (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              No players match the current filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlScore;
