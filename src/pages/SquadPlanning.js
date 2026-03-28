import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext, DragOverlay, useDroppable, useDraggable,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  Search, X, Plus, UserCheck, ScanEye, ChevronDown, ChevronUp,
  Trash2, ArrowRight, ArrowUpDown, GripVertical, Star,
} from 'lucide-react';
import { useSquad } from '../contexts/SquadContext';
import { useTactics } from '../contexts/TacticsContext';
import { ROLE_NAMES, ROLE_FORMULAS } from '../utils/roleCalculations';

// ─── helpers ─────────────────────────────────────────────────────────────────

const SLOT_LABELS = ['Starter', '2nd', '3rd'];

const scoreColor = (s) => {
  if (s == null || isNaN(s)) return 'text-gray-400 dark:text-gray-500';
  if (s >= 15) return 'text-yellow-500 dark:text-yellow-400';
  if (s >= 13) return 'text-blue-500 dark:text-blue-400';
  if (s >= 11) return 'text-green-600 dark:text-green-400';
  if (s >= 8)  return 'text-gray-500 dark:text-gray-400';
  return 'text-red-500 dark:text-red-400';
};

const scoreBg = (s) => {
  if (s == null || isNaN(s)) return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
  if (s >= 15) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  if (s >= 13) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
  if (s >= 11) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  return 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
};

const GROUP_COLORS = {
  GK:  { badge: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700', header: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' },
  DEF: { badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',   header: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
  MID: { badge: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700', header: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' },
  FWD: { badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',   header: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' },
};
const GROUP_NAMES  = { GK: 'Goalkeepers', DEF: 'Defenders', MID: 'Midfielders', FWD: 'Forwards' };
const GROUP_ORDER  = ['GK', 'DEF', 'MID', 'FWD'];

const getRoleScore = (player, roleKey) => {
  if (!roleKey) return null;
  if (player.roleScores?.[roleKey] != null) return player.roleScores[roleKey];
  const f = ROLE_FORMULAS[roleKey];
  if (!f) return null;
  const s = f(player);
  return isNaN(s) ? null : s;
};

// ─── DnD sub-components ──────────────────────────────────────────────────────

// Small card rendered inside DragOverlay while dragging
const DragGhost = ({ player, score, roleKey }) => (
  <div className={`flex items-center gap-2 rounded-lg px-2.5 py-2 border shadow-2xl w-44 ${scoreBg(score)}`}>
    <GripVertical className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
        {player.Name || player['Name']}
      </div>
      {score != null && (
        <div className={`text-xs font-bold ${scoreColor(score)}`}>
          {score.toFixed(1)} <span className="font-normal text-gray-400">{roleKey}</span>
        </div>
      )}
    </div>
  </div>
);

// Draggable player card (assigned slot)
const DraggableCard = ({ player, slotId, slotIndex, score, roleKey, onRemove, onMoveUp, onMoveDown }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${slotId}::${slotIndex}`,
    data: { fromSlotId: slotId, fromIndex: slotIndex, player, score, roleKey },
  });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.35 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-1.5 rounded-lg px-2 py-2 border group transition-shadow ${scoreBg(score)} ${isDragging ? 'shadow-none' : ''}`}
    >
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing mt-0.5 text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 flex-shrink-0"
        title="Drag to move"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

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
          <div className={`text-sm font-bold mt-0.5 ${scoreColor(score)}`}>
            {score.toFixed(1)}
            <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-1">{roleKey}</span>
          </div>
        )}
      </div>

      {/* Actions (visible on hover) */}
      <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto">
        {onMoveUp   && <button onClick={onMoveUp}   className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs leading-none">▲</button>}
        {onMoveDown && <button onClick={onMoveDown} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs leading-none">▼</button>}
        <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors mt-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// Droppable wrapper for each slot cell
const DroppableSlot = ({ slotId, slotIndex, children }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${slotId}::${slotIndex}::drop`,
    data: { toSlotId: slotId, toIndex: slotIndex },
  });
  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg transition-all ${isOver ? 'ring-2 ring-primary-400 dark:ring-primary-500 ring-offset-1' : ''}`}
    >
      {children}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const SquadPlanning = () => {
  const {
    players, planningScouts, depthChart,
    addToDepthChart, removeFromDepthChart, moveInDepthChart,
    movePlayerAcrossDepthChart, clearDepthChart, removePlanningScout,
  } = useSquad();
  const { tacticSetup } = useTactics();

  const [activePick, setActivePick]   = useState(null); // { slotId, slotIndex }
  const [activeDrag, setActiveDrag]   = useState(null); // drag ghost data
  const [pickerTab, setPickerTab]     = useState('squad');
  const [pickerSearch, setPickerSearch] = useState('');
  const [collapsed, setCollapsed]     = useState({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const toggleGroup = (g) => setCollapsed(p => ({ ...p, [g]: !p[g] }));

  const openPicker  = (slotId, slotIndex) => { setActivePick({ slotId, slotIndex }); setPickerSearch(''); setPickerTab('squad'); };
  const closePicker = () => setActivePick(null);

  const assignPlayer = (playerRef) => {
    if (!activePick) return;
    addToDepthChart(activePick.slotId, playerRef);
    closePicker();
  };

  // ── DnD handlers ──────────────────────────────────────────────────────────
  const handleDragStart = ({ active }) => setActiveDrag(active.data.current);

  const handleDragEnd = ({ active, over }) => {
    setActiveDrag(null);
    if (!over) return;
    const { fromSlotId, fromIndex } = active.data.current;
    const { toSlotId, toIndex }     = over.data.current;
    if (fromSlotId === toSlotId && fromIndex === toIndex) return;
    movePlayerAcrossDepthChart(fromSlotId, fromIndex, toSlotId, toIndex);
  };

  // ── Picker data ────────────────────────────────────────────────────────────

  // Which role key the currently-open picker slot uses
  const activeRoleKey = useMemo(() => {
    if (!activePick || !tacticSetup) return null;
    return tacticSetup.slots.find(s => s.id === activePick.slotId)?.roleKey || null;
  }, [activePick, tacticSetup]);

  // All tactic role keys (for best-fit calculation)
  const tacticRoleKeys = useMemo(() => (tacticSetup?.slots || []).map(s => s.roleKey), [tacticSetup]);

  // Map of playerId → { positionLabel, slotLabel } for already-assigned players
  const alreadyAssignedMap = useMemo(() => {
    const map = {};
    if (!tacticSetup) return map;
    for (const [slotId, slotPlayers] of Object.entries(depthChart)) {
      const slot = tacticSetup.slots.find(s => s.id === slotId);
      (slotPlayers || []).forEach((p, idx) => {
        map[p.id] = { positionLabel: slot?.positionLabel || slotId, slotLabel: SLOT_LABELS[idx] || `#${idx + 1}` };
      });
    }
    return map;
  }, [depthChart, tacticSetup]);

  // Returns the tactic roleKey that gives this player their best score
  const getBestTacticRole = useCallback((player) => {
    if (!tacticRoleKeys.length) return null;
    let bestKey = null, bestScore = -Infinity;
    for (const rk of tacticRoleKeys) {
      const s = getRoleScore(player, rk);
      if (s != null && s > bestScore) { bestScore = s; bestKey = rk; }
    }
    return bestKey;
  }, [tacticRoleKeys]);

  // Filtered + scored + sorted picker lists
  const filteredSquad = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    let result = players.filter(p =>
      !q || (p.Name || '').toLowerCase().includes(q) || (p.Position || '').toLowerCase().includes(q)
    );
    if (activeRoleKey) {
      result = result
        .map(p => ({ ...p, _score: getRoleScore(p, activeRoleKey) }))
        .sort((a, b) => (b._score ?? -1) - (a._score ?? -1));
    }
    return result;
  }, [players, pickerSearch, activeRoleKey]);

  const filteredScouts = useMemo(() => {
    const q = pickerSearch.toLowerCase();
    let result = planningScouts.filter(p =>
      !q || (p['Name'] || '').toLowerCase().includes(q) ||
            (p['Position'] || '').toLowerCase().includes(q) ||
            (p['Club'] || '').toLowerCase().includes(q)
    );
    if (activeRoleKey) {
      result = result
        .map(p => ({ ...p, _score: getRoleScore(p, activeRoleKey) }))
        .sort((a, b) => (b._score ?? -1) - (a._score ?? -1));
    }
    return result;
  }, [planningScouts, pickerSearch, activeRoleKey]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalSlots  = tacticSetup?.slots?.length || 0;
  const filledSlots = tacticSetup?.slots?.filter(s => (depthChart[s.id] || []).length > 0).length || 0;

  const slotsByGroup = useMemo(() => {
    if (!tacticSetup?.slots) return {};
    return tacticSetup.slots.reduce((acc, s) => {
      (acc[s.group] = acc[s.group] || []).push(s);
      return acc;
    }, {});
  }, [tacticSetup]);

  // ── No tactic guard ────────────────────────────────────────────────────────
  if (!tacticSetup) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Squad Planning</h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center">
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

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Squad Planning</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {tacticSetup.formation} · depth charts per position · drag to rearrange
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
              {planningScouts.length} scout{planningScouts.length !== 1 ? 's' : ''}
            </div>
          )}
          {Object.values(depthChart).some(s => s?.length > 0) && (
            <button
              onClick={() => { if (window.confirm('Clear the entire depth chart?')) clearDepthChart(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:text-red-600 border border-red-200 dark:border-red-800 hover:border-red-400 rounded-lg transition-colors"
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

      {players.length === 0 && planningScouts.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
          <strong>Tip:</strong> Import your squad in <em>Squad Analysis</em> or bookmark scouted players from <em>Scouting Pool</em>.
        </div>
      )}

      {/* ── Depth chart wrapped in DndContext ── */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="space-y-4">
          {GROUP_ORDER.filter(g => slotsByGroup[g]).map(group => {
            const gc = GROUP_COLORS[group];
            const isCollapsed = collapsed[group];
            return (
              <div key={group} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
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
                    <div className="grid grid-cols-[200px_1fr_1fr_1fr] px-4 py-2 bg-gray-50 dark:bg-gray-700/30 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      <span>Position · Role</span>
                      <span>Starter</span>
                      <span>2nd Choice</span>
                      <span>3rd Choice</span>
                    </div>

                    {slotsByGroup[group].map(slot => {
                      const slotPlayers = depthChart[slot.id] || [];
                      const roleName = ROLE_NAMES[slot.roleKey] || slot.roleKey;
                      return (
                        <div key={slot.id} className="grid grid-cols-[200px_1fr_1fr_1fr] items-start hover:bg-gray-50/50 dark:hover:bg-gray-700/10 transition-colors">
                          {/* Position label col */}
                          <div className="px-4 py-3">
                            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${gc.badge}`}>
                              {slot.positionLabel}
                            </span>
                            <div className="mt-1">
                              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{roleName}</span>
                              <span className="text-xs text-gray-400 ml-1">({slot.roleKey})</span>
                            </div>
                            <div className="text-xs text-gray-400">{slot.fullLabel}</div>
                          </div>

                          {/* Depth slots 0, 1, 2 */}
                          {[0, 1, 2].map(slotIndex => {
                            const player = slotPlayers[slotIndex];
                            const score  = player ? getRoleScore(player, slot.roleKey) : null;
                            return (
                              <div key={slotIndex} className="px-2 py-3 border-l border-gray-100 dark:border-gray-700/50">
                                <DroppableSlot slotId={slot.id} slotIndex={slotIndex}>
                                  {player ? (
                                    <DraggableCard
                                      player={player}
                                      slotId={slot.id}
                                      slotIndex={slotIndex}
                                      score={score}
                                      roleKey={slot.roleKey}
                                      onRemove={() => removeFromDepthChart(slot.id, slotIndex)}
                                      onMoveUp={slotIndex > 0 ? () => moveInDepthChart(slot.id, slotIndex, slotIndex - 1) : null}
                                      onMoveDown={slotIndex < slotPlayers.length - 1 ? () => moveInDepthChart(slot.id, slotIndex, slotIndex + 1) : null}
                                    />
                                  ) : (
                                    <button
                                      onClick={() => openPicker(slot.id, slotIndex)}
                                      className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span className="text-xs">{SLOT_LABELS[slotIndex]}</span>
                                    </button>
                                  )}
                                </DroppableSlot>
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

        {/* Floating drag ghost */}
        <DragOverlay dropAnimation={null}>
          {activeDrag ? (
            <DragGhost player={activeDrag.player} score={activeDrag.score} roleKey={activeDrag.roleKey} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── Player Picker Modal ── */}
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

            {/* Legend */}
            <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-700/40 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" /> Best tactic role
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Already assigned
              </span>
              {activeRoleKey && (
                <span className="flex items-center gap-1 ml-auto">
                  <ArrowUpDown className="w-3 h-3" /> Sorted by {ROLE_NAMES[activeRoleKey] || activeRoleKey}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button onClick={() => setPickerTab('squad')} className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${pickerTab === 'squad' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
                <UserCheck className="w-4 h-4 inline mr-1.5" />Squad ({players.length})
              </button>
              <button onClick={() => setPickerTab('scouts')} className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${pickerTab === 'scouts' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
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
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1">
              {pickerTab === 'squad' && (
                filteredSquad.length === 0
                  ? <div className="py-12 text-center text-sm text-gray-400">{players.length === 0 ? 'No squad imported.' : 'No players match.'}</div>
                  : filteredSquad.map(player => {
                      const assignedAt   = alreadyAssignedMap[player.id];
                      const isBestHere   = getBestTacticRole(player) === activeRoleKey;
                      return (
                        <button
                          key={player.id}
                          onClick={() => assignPlayer({ id: player.id, Name: player.Name, Position: player.Position, Age: player.Age, isScout: false, roleScores: player.roleScores })}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${assignedAt ? 'bg-gray-50 dark:bg-gray-700/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                        >
                          <UserCheck className={`w-4 h-4 flex-shrink-0 ${assignedAt ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-sm font-semibold ${assignedAt ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {player.Name}
                              </span>
                              {isBestHere && (
                                <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 font-semibold border border-yellow-200 dark:border-yellow-700">
                                  <Star className="w-2.5 h-2.5" /> Best fit
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {player.Position} · Age {player.Age}
                              {assignedAt && (
                                <span className="ml-2 text-gray-400 dark:text-gray-500 italic">
                                  → {assignedAt.positionLabel} {assignedAt.slotLabel}
                                </span>
                              )}
                            </div>
                          </div>
                          {player._score != null && (
                            <span className={`text-sm font-bold flex-shrink-0 ${assignedAt ? 'opacity-50' : ''} ${scoreColor(player._score)}`}>
                              {player._score.toFixed(1)}
                            </span>
                          )}
                        </button>
                      );
                    })
              )}

              {pickerTab === 'scouts' && (
                filteredScouts.length === 0
                  ? <div className="py-12 text-center text-sm text-gray-400">{planningScouts.length === 0 ? 'No scouts in plan.' : 'No scouts match.'}</div>
                  : filteredScouts.map(scout => {
                      const assignedAt = alreadyAssignedMap[scout.id];
                      const isBestHere = getBestTacticRole(scout) === activeRoleKey;
                      return (
                        <button
                          key={scout.id}
                          onClick={() => assignPlayer({ id: scout.id, Name: scout['Name'], Position: scout['Position'], Age: scout['Age'], isScout: true, Club: scout['Club'], ...scout })}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${assignedAt ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                        >
                          <ScanEye className={`w-4 h-4 flex-shrink-0 ${assignedAt ? 'text-purple-300 dark:text-purple-700' : 'text-purple-400'}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`text-sm font-semibold ${assignedAt ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {scout['Name']}
                              </span>
                              {isBestHere && (
                                <span className="inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 font-semibold border border-yellow-200 dark:border-yellow-700">
                                  <Star className="w-2.5 h-2.5" /> Best fit
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {scout['Position']} · Age {scout['Age']}
                              {scout['Club'] ? ` · ${scout['Club']}` : ''}
                              {assignedAt && (
                                <span className="ml-2 text-gray-400 dark:text-gray-500 italic">
                                  → {assignedAt.positionLabel} {assignedAt.slotLabel}
                                </span>
                              )}
                            </div>
                          </div>
                          {scout._score != null && (
                            <span className={`text-sm font-bold flex-shrink-0 ${assignedAt ? 'opacity-50' : ''} ${scoreColor(scout._score)}`}>
                              {scout._score.toFixed(1)}
                            </span>
                          )}
                        </button>
                      );
                    })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquadPlanning;
