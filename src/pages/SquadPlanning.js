import React, { useState, useMemo } from 'react';
import { Search, X, Plus, UserCheck, ScanEye, ChevronDown, ChevronUp, Trash2, ArrowRight, ArrowUpDown } from 'lucide-react';
import { useSquad } from '../contexts/SquadContext';
import { useTactics } from '../contexts/TacticsContext';
import { ROLE_NAMES, ROLE_FORMULAS } from '../utils/roleCalculations';

const SLOT_LABELS = ['Starter', '2nd', '3rd'];

const SCORE_COLOR = (score) => {
  if (score == null || isNaN(score)) return 'text-gray-400 dark:text-gray-500';
  if (score >= 15) return 'text-yellow-500 dark:text-yellow-400';
  if (score >= 13) return 'text-blue-500 dark:text-blue-400';
  if (score >= 11) return 'text-green-600 dark:text-green-400';
  if (score >= 8)  return 'text-gray-500 dark:text-gray-400';
  return 'text-red-500 dark:text-red-400';
};

const SCORE_BG = (score) => {
  if (score == null || isNaN(score)) return '';
  if (score >= 15) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  if (score >= 13) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  if (score >= 11) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
};

const GROUP_COLORS = {
  GK:  { badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700', header: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' },
  DEF: { badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',   header: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
  MID: { badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700', header: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' },
  FWD: { badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',   header: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' },
};
const GROUP_NAMES = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Forwards' };
const GROUP_ORDER = ['GK', 'DEF', 'MID', 'FWD'];

// Compute role score for a player (squad or scout)
const getRoleScore = (player, roleKey) => {
  if (!roleKey) return null;
  // Squad players have pre-computed roleScores
  if (player.roleScores && player.roleScores[roleKey] != null) {
    return player.roleScores[roleKey];
  }
  // Scouted players: compute on the fly
  const formula = ROLE_FORMULAS[roleKey];
  if (!formula) return null;
  const score = formula(player);
  return isNaN(score) ? null : score;
};

const SquadPlanning = () => {
  const {
    players, planningScouts, depthChart,
    addToDepthChart, removeFromDepthChart, moveInDepthChart, clearDepthChart, removePlanningScout,
  } = useSquad();
  const { tacticSetup } = useTactics();

  const [activePick, setActivePick] = useState(null); // { slotId, slotIndex }
  const [pickerTab, setPickerTab] = useState('squad');
  const [pickerSearch, setPickerSearch] = useState('');
  const [collapsed, setCollapsed] = useState({});

  const toggleGroup = (g) => setCollapsed(p => ({ ...p, [g]: !p[g] }));

  const openPicker = (slotId, slotIndex) => {
    setActivePick({ slotId, slotIndex });
    setPickerSearch('');
    setPickerTab('squad');
  };
  const closePicker = () => setActivePick(null);

  const assignPlayer = (playerRef) => {
    if (!activePick) return;
    addToDepthChart(activePick.slotId, playerRef);
    closePicker();
  };

  // The active slot's role key (for sorting picker)
  const activeRoleKey = useMemo(() => {
    if (!activePick || !tacticSetup) return null;
    const slot = tacticSetup.slots.find(s => s.id === activePick.slotId);
    return slot?.roleKey || null;
  }, [activePick, tacticSetup]);

  // Filtered + sorted picker lists
  const filteredSquad = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    let result = players.filter(p =>
      !q || (p.Name || '').toLowerCase().includes(q) || (p.Position || '').toLowerCase().includes(q)
    );
    if (activeRoleKey) {
      result = result
        .map(p => ({ ...p, _score: getRoleScore(p, activeRoleKey) }))
        .sort((a, b) => (b._score || 0) - (a._score || 0));
    }
    return result;
  }, [players, pickerSearch, activeRoleKey]);

  const filteredScouts = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    let result = planningScouts.filter(p =>
      !q ||
      (p['Name'] || '').toLowerCase().includes(q) ||
      (p['Position'] || '').toLowerCase().includes(q) ||
      (p['Club'] || '').toLowerCase().includes(q)
    );
    if (activeRoleKey) {
      result = result
        .map(p => ({ ...p, _score: getRoleScore(p, activeRoleKey) }))
        .sort((a, b) => (b._score || 0) - (a._score || 0));
    }
    return result;
  }, [planningScouts, pickerSearch, activeRoleKey]);

  // Stats
  const totalSlots = tacticSetup?.slots?.length || 0;
  const filledSlots = tacticSetup?.slots?.filter(s => (depthChart[s.id] || []).length > 0).length || 0;

  // Group tactic slots
  const slotsByGroup = useMemo(() => {
    if (!tacticSetup?.slots) return {};
    return tacticSetup.slots.reduce((acc, s) => {
      (acc[s.group] = acc[s.group] || []).push(s);
      return acc;
    }, {});
  }, [tacticSetup]);

  // No tactic setup yet
  if (!tacticSetup) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Squad Planning</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
          <Trash2 className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No tactic set up yet</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
            Go to the Dashboard and configure your preferred formation and role for each position first.
          </p>
          <a href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors">
            Set up on Dashboard <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Squad Planning</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {tacticSetup.formation} formation · depth charts per position
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
            <span className="font-semibold text-gray-900 dark:text-white">{filledSlots}</span>
            <span className="text-gray-400"> / {totalSlots}</span>
            <span className="ml-1">positions covered</span>
          </div>
          {planningScouts.length > 0 && (
            <div className="text-sm bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-lg px-3 py-1.5">
              <ScanEye className="w-3.5 h-3.5 inline mr-1" />
              {planningScouts.length} scout{planningScouts.length !== 1 ? 's' : ''} in plan
            </div>
          )}
          {Object.keys(depthChart).some(k => (depthChart[k] || []).length > 0) && (
            <button
              onClick={() => { if (window.confirm('Clear the entire depth chart?')) clearDepthChart(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Scout shelf */}
      {planningScouts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-700 p-3">
          <div className="flex items-center gap-2 mb-2">
            <ScanEye className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Scouted Players in Plan</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {planningScouts.map(scout => (
              <div key={scout.id} className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg px-2.5 py-1 text-sm">
                <span className="font-medium text-purple-800 dark:text-purple-200">{scout['Name']}</span>
                <span className="text-purple-500 text-xs">{scout['Position']}</span>
                {scout['Club'] && <span className="text-gray-400 text-xs">· {scout['Club']}</span>}
                <button onClick={() => removePlanningScout(scout.id)} className="ml-1 text-purple-400 hover:text-red-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No squad notice */}
      {players.length === 0 && planningScouts.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
          <strong>Tip:</strong> Import your squad in <em>Squad Analysis</em> or add scouted players via the <em>Scouting Pool</em> to fill the depth chart.
        </div>
      )}

      {/* Depth chart — grouped by position area */}
      <div className="space-y-4">
        {GROUP_ORDER.filter(g => slotsByGroup[g]).map(group => {
          const gc = GROUP_COLORS[group];
          const isCollapsed = collapsed[group];
          return (
            <div key={group} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              {/* Group header */}
              <button
                className={`w-full flex items-center justify-between px-4 py-3 border-b ${gc.header} hover:opacity-90 transition-opacity`}
                onClick={() => toggleGroup(group)}
              >
                <span className={`font-bold text-sm uppercase tracking-wide ${gc.badge.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                  {GROUP_NAMES[group]}
                </span>
                {isCollapsed ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {/* Column headers */}
                  <div className="grid grid-cols-[200px_1fr_1fr_1fr] px-4 py-2 bg-gray-50 dark:bg-gray-700/30 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <span>Position · Role</span>
                    <span>Starter</span>
                    <span>2nd Choice</span>
                    <span>3rd Choice</span>
                  </div>

                  {slotsByGroup[group].map(slot => {
                    const slots = depthChart[slot.id] || [];
                    const roleName = ROLE_NAMES[slot.roleKey] || slot.roleKey;
                    return (
                      <div key={slot.id} className="grid grid-cols-[200px_1fr_1fr_1fr] items-start hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        {/* Position label */}
                        <div className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${gc.badge}`}>
                              {slot.positionLabel}
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{roleName}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({slot.roleKey})</span>
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{slot.fullLabel}</div>
                        </div>

                        {/* Slots 0, 1, 2 */}
                        {[0, 1, 2].map(slotIndex => {
                          const player = slots[slotIndex];
                          const score = player ? getRoleScore(player, slot.roleKey) : null;
                          return (
                            <div key={slotIndex} className="px-2 py-3 border-l border-gray-100 dark:border-gray-700/50">
                              {player ? (
                                <div className={`flex items-start gap-2 rounded-lg px-2.5 py-2 border group ${SCORE_BG(score)}`}>
                                  {player.isScout
                                    ? <ScanEye className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                                    : <UserCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                  }
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                      {player.Name || player['Name']}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {player.Position || player['Position']}
                                      {(player.Age || player['Age']) ? ` · ${player.Age || player['Age']}` : ''}
                                    </div>
                                    {score != null && (
                                      <div className={`text-sm font-bold mt-0.5 ${SCORE_COLOR(score)}`}>
                                        {score.toFixed(1)}
                                        <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">{slot.roleKey}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-auto flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    {slotIndex > 0 && (
                                      <button onClick={() => moveInDepthChart(slot.id, slotIndex, slotIndex - 1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs leading-none">▲</button>
                                    )}
                                    {slotIndex < slots.length - 1 && (
                                      <button onClick={() => moveInDepthChart(slot.id, slotIndex, slotIndex + 1)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs leading-none">▼</button>
                                    )}
                                    <button onClick={() => removeFromDepthChart(slot.id, slotIndex)} className="text-gray-400 hover:text-red-500 transition-colors mt-0.5">
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => openPicker(slot.id, slotIndex)}
                                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors text-sm"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span className="text-xs">{SLOT_LABELS[slotIndex]}</span>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Player Picker Modal */}
      {activePick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closePicker} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Assign Player</h2>
                {(() => {
                  const s = tacticSetup.slots.find(x => x.id === activePick.slotId);
                  return s ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {s.positionLabel} · {ROLE_NAMES[s.roleKey] || s.roleKey} · {SLOT_LABELS[activePick.slotIndex]}
                    </p>
                  ) : null;
                })()}
              </div>
              <button onClick={closePicker} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setPickerTab('squad')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  pickerTab === 'squad'
                    ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <UserCheck className="w-4 h-4 inline mr-1.5" />Squad ({players.length})
              </button>
              <button
                onClick={() => setPickerTab('scouts')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  pickerTab === 'scouts'
                    ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ScanEye className="w-4 h-4 inline mr-1.5" />Scouts ({planningScouts.length})
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              {activeRoleKey && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  Sorted by {ROLE_NAMES[activeRoleKey] || activeRoleKey} score
                </p>
              )}
            </div>

            {/* Player list */}
            <div className="overflow-y-auto flex-1">
              {pickerTab === 'squad' && (
                filteredSquad.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    {players.length === 0 ? 'No squad imported. Go to Squad Analysis.' : 'No players match.'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {filteredSquad.map(player => (
                      <button
                        key={player.id}
                        onClick={() => assignPlayer({ id: player.id, Name: player.Name, Position: player.Position, Age: player.Age, isScout: false, roleScores: player.roleScores })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{player.Name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{player.Position} · Age {player.Age}</div>
                        </div>
                        {player._score != null && (
                          <span className={`text-sm font-bold flex-shrink-0 ${SCORE_COLOR(player._score)}`}>
                            {player._score.toFixed(1)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}
              {pickerTab === 'scouts' && (
                filteredScouts.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    {planningScouts.length === 0 ? 'No scouts in plan. Add from Scouting Pool.' : 'No scouts match.'}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {filteredScouts.map(scout => (
                      <button
                        key={scout.id}
                        onClick={() => assignPlayer({ id: scout.id, Name: scout['Name'], Position: scout['Position'], Age: scout['Age'], isScout: true, Club: scout['Club'], ...scout })}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        <ScanEye className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{scout['Name']}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {scout['Position']} · Age {scout['Age']}{scout['Club'] ? ` · ${scout['Club']}` : ''}
                          </div>
                        </div>
                        {scout._score != null && (
                          <span className={`text-sm font-bold flex-shrink-0 ${SCORE_COLOR(scout._score)}`}>
                            {scout._score.toFixed(1)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadPlanning;
