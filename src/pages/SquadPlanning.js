import React, { useState, useMemo } from 'react';
import { Search, X, Plus, UserCheck, ScanEye, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useSquad } from '../contexts/SquadContext';

// All positions grouped for the depth chart
const POSITION_GROUPS = [
  {
    label: 'Goalkeepers',
    colorClass: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400',
    headerClass: 'bg-yellow-500/20',
    positions: [
      { key: 'GK', label: 'Goalkeeper' },
    ],
  },
  {
    label: 'Defenders',
    colorClass: 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400',
    headerClass: 'bg-blue-500/20',
    positions: [
      { key: 'CB', label: 'Centre-Back' },
      { key: 'LB', label: 'Left Back' },
      { key: 'RB', label: 'Right Back' },
      { key: 'LWB', label: 'Left Wing-Back' },
      { key: 'RWB', label: 'Right Wing-Back' },
      { key: 'SW', label: 'Sweeper' },
    ],
  },
  {
    label: 'Midfielders',
    colorClass: 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400',
    headerClass: 'bg-green-500/20',
    positions: [
      { key: 'DM', label: 'Defensive Mid' },
      { key: 'CM', label: 'Central Mid' },
      { key: 'AM', label: 'Attacking Mid' },
      { key: 'LM', label: 'Left Mid' },
      { key: 'RM', label: 'Right Mid' },
      { key: 'WM', label: 'Wide Mid' },
    ],
  },
  {
    label: 'Forwards',
    colorClass: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400',
    headerClass: 'bg-red-500/20',
    positions: [
      { key: 'LW', label: 'Left Wing' },
      { key: 'RW', label: 'Right Wing' },
      { key: 'CF', label: 'Centre Forward' },
      { key: 'ST', label: 'Striker' },
      { key: 'SS', label: 'Second Striker' },
    ],
  },
];

const SLOT_LABELS = ['Starter', '2nd Choice', '3rd Choice'];

const SquadPlanning = () => {
  const {
    players,
    planningScouts,
    depthChart,
    addToDepthChart,
    removeFromDepthChart,
    moveInDepthChart,
    clearDepthChart,
    removePlanningScout,
  } = useSquad();

  // Which slot is being filled: { positionKey, slotIndex }
  const [activePick, setActivePick] = useState(null);
  const [pickerTab, setPickerTab] = useState('squad'); // 'squad' | 'scouts'
  const [pickerSearch, setPickerSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});

  // Stats
  const totalPositions = POSITION_GROUPS.reduce((sum, g) => sum + g.positions.length, 0);
  const filledPositions = Object.values(depthChart).filter(slots => slots && slots.length > 0).length;

  const toggleGroup = (label) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const openPicker = (positionKey, slotIndex) => {
    setActivePick({ positionKey, slotIndex });
    setPickerSearch('');
    setPickerTab('squad');
  };

  const closePicker = () => setActivePick(null);

  const assignPlayer = (playerRef) => {
    if (!activePick) return;
    addToDepthChart(activePick.positionKey, playerRef);
    closePicker();
  };

  // Filtered players for picker
  const filteredSquadPlayers = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    return players.filter(p =>
      !q ||
      (p.Name || '').toLowerCase().includes(q) ||
      (p.Position || '').toLowerCase().includes(q)
    );
  }, [players, pickerSearch]);

  const filteredScouts = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    return planningScouts.filter(p =>
      !q ||
      (p['Name'] || '').toLowerCase().includes(q) ||
      (p['Position'] || '').toLowerCase().includes(q) ||
      (p['Club'] || '').toLowerCase().includes(q)
    );
  }, [planningScouts, pickerSearch]);

  // Already assigned IDs for the active position (to highlight dupes)
  const assignedIds = activePick
    ? new Set((depthChart[activePick.positionKey] || []).map(p => p.id))
    : new Set();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Squad Planning</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Build depth charts for every position
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
            <span className="font-semibold text-gray-900 dark:text-white">{filledPositions}</span>
            <span className="text-gray-400 dark:text-gray-500"> / {totalPositions}</span>
            <span className="ml-1">positions covered</span>
          </div>
          {planningScouts.length > 0 && (
            <div className="text-sm bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300 rounded-lg px-3 py-1.5">
              <ScanEye className="w-3.5 h-3.5 inline mr-1" />
              {planningScouts.length} scout{planningScouts.length !== 1 ? 's' : ''} in plan
            </div>
          )}
          {Object.keys(depthChart).length > 0 && (
            <button
              onClick={() => { if (window.confirm('Clear the entire depth chart?')) clearDepthChart(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 border border-red-200 dark:border-red-800 hover:border-red-400 dark:hover:border-red-600 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear Chart
            </button>
          )}
        </div>
      </div>

      {/* Scout shelf (if planning scouts exist) */}
      {planningScouts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-700 p-3">
          <div className="flex items-center gap-2 mb-2">
            <ScanEye className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Scouted Players in Plan</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">(assign them to positions using the + button below)</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {planningScouts.map(scout => (
              <div
                key={scout.id}
                className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg px-2.5 py-1 text-sm"
              >
                <span className="font-medium text-purple-800 dark:text-purple-200">{scout['Name']}</span>
                <span className="text-purple-500 dark:text-purple-400 text-xs">{scout['Position']}</span>
                {scout['Club'] && <span className="text-gray-400 text-xs">· {scout['Club']}</span>}
                <button
                  onClick={() => removePlanningScout(scout.id)}
                  className="ml-1 text-purple-400 hover:text-red-500 transition-colors"
                  title="Remove from plan"
                >
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
          <strong>Tip:</strong> Import your squad in <em>Squad Analysis</em> or add scouted players via the <em>Scouting Pool</em> to start filling the depth chart.
        </div>
      )}

      {/* Depth Chart */}
      <div className="space-y-4">
        {POSITION_GROUPS.map(group => {
          const isCollapsed = collapsedGroups[group.label];
          return (
            <div key={group.label} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              {/* Group header */}
              <button
                className={`w-full flex items-center justify-between px-4 py-3 ${group.headerClass} border-b border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity`}
                onClick={() => toggleGroup(group.label)}
              >
                <span className={`font-bold text-sm uppercase tracking-wide ${group.colorClass.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                  {group.label}
                </span>
                {isCollapsed
                  ? <ChevronDown className="w-4 h-4 text-gray-500" />
                  : <ChevronUp className="w-4 h-4 text-gray-500" />
                }
              </button>

              {!isCollapsed && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {/* Column headers */}
                  <div className="grid grid-cols-[180px_1fr_1fr_1fr] gap-0 px-4 py-2 bg-gray-50 dark:bg-gray-700/30 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    <span>Position</span>
                    <span>Starter</span>
                    <span>2nd Choice</span>
                    <span>3rd Choice</span>
                  </div>

                  {group.positions.map(pos => {
                    const slots = depthChart[pos.key] || [];
                    return (
                      <div key={pos.key} className="grid grid-cols-[180px_1fr_1fr_1fr] gap-0 items-center hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        {/* Position label */}
                        <div className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${group.colorClass}`}>
                            {pos.key}
                          </span>
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{pos.label}</span>
                        </div>

                        {/* Slots 0, 1, 2 */}
                        {[0, 1, 2].map(slotIndex => {
                          const player = slots[slotIndex];
                          return (
                            <div key={slotIndex} className="px-2 py-3 border-l border-gray-100 dark:border-gray-700/50">
                              {player ? (
                                <div className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 group ${
                                  player.isScout
                                    ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700'
                                    : 'bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                                }`}>
                                  {player.isScout && (
                                    <ScanEye className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                  )}
                                  {!player.isScout && (
                                    <UserCheck className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                      {player.Name || player['Name']}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                      {player.Position || player['Position']}
                                      {player.Age || player['Age'] ? ` · ${player.Age || player['Age']}` : ''}
                                      {player.isScout && (player['Club'] ? ` · ${player['Club']}` : '')}
                                    </div>
                                  </div>
                                  <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                    {slotIndex > 0 && (
                                      <button
                                        onClick={() => moveInDepthChart(pos.key, slotIndex, slotIndex - 1)}
                                        className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        title="Move up"
                                      >
                                        ▲
                                      </button>
                                    )}
                                    {slotIndex < slots.length - 1 && (
                                      <button
                                        onClick={() => moveInDepthChart(pos.key, slotIndex, slotIndex + 1)}
                                        className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        title="Move down"
                                      >
                                        ▼
                                      </button>
                                    )}
                                    <button
                                      onClick={() => removeFromDepthChart(pos.key, slotIndex)}
                                      className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                                      title="Remove"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => openPicker(pos.key, slotIndex)}
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
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">Assign Player</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {activePick.positionKey} · {SLOT_LABELS[activePick.slotIndex]}
                </p>
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
                <UserCheck className="w-4 h-4 inline mr-1.5" />
                Squad ({players.length})
              </button>
              <button
                onClick={() => setPickerTab('scouts')}
                className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  pickerTab === 'scouts'
                    ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <ScanEye className="w-4 h-4 inline mr-1.5" />
                Scouts ({planningScouts.length})
              </button>
            </div>

            {/* Search */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={pickerTab === 'squad' ? 'Search by name or position...' : 'Search by name, position, or club...'}
                  value={pickerSearch}
                  onChange={e => setPickerSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Player list */}
            <div className="overflow-y-auto flex-1">
              {pickerTab === 'squad' && (
                <>
                  {filteredSquadPlayers.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                      {players.length === 0
                        ? 'No squad imported. Go to Squad Analysis to import your squad.'
                        : 'No players match your search.'}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {filteredSquadPlayers.map(player => {
                        const alreadyAssigned = assignedIds.has(player.id);
                        return (
                          <button
                            key={player.id}
                            onClick={() => assignPlayer({ id: player.id, Name: player.Name, Position: player.Position, Age: player.Age, isScout: false })}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${alreadyAssigned ? 'opacity-50' : ''}`}
                          >
                            <UserCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {player.Name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {player.Position} · Age {player.Age}
                              </div>
                            </div>
                            {alreadyAssigned && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 italic">already in slot</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {pickerTab === 'scouts' && (
                <>
                  {filteredScouts.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                      {planningScouts.length === 0
                        ? 'No scouted players in plan. Use the Scouting Pool to add players.'
                        : 'No scouts match your search.'}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {filteredScouts.map(scout => {
                        const alreadyAssigned = assignedIds.has(scout.id);
                        return (
                          <button
                            key={scout.id}
                            onClick={() => assignPlayer({ id: scout.id, Name: scout['Name'], Position: scout['Position'], Age: scout['Age'], isScout: true, Club: scout['Club'] })}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${alreadyAssigned ? 'opacity-50' : ''}`}
                          >
                            <ScanEye className="w-4 h-4 text-purple-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {scout['Name']}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {scout['Position']} · Age {scout['Age']}
                                {scout['Club'] ? ` · ${scout['Club']}` : ''}
                              </div>
                            </div>
                            {alreadyAssigned && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 italic">already in slot</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadPlanning;
