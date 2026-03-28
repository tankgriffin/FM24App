import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Upload, Search, X, BookmarkPlus, BookmarkCheck, Plus, ChevronDown, ArrowUpDown } from 'lucide-react';
import { ROLE_NAMES, ROLE_FORMULAS } from '../utils/roleCalculations';
import { useSquad } from '../contexts/SquadContext';

const getRoleScoreColor = (score) => {
  if (score >= 15) return 'text-yellow-500 dark:text-yellow-400';
  if (score >= 13) return 'text-blue-500 dark:text-blue-400';
  if (score >= 11) return 'text-green-600 dark:text-green-400';
  if (score >= 8)  return 'text-gray-600 dark:text-gray-300';
  return 'text-red-500 dark:text-red-400';
};

const getRoleScoreBg = (score) => {
  if (score >= 15) return 'bg-yellow-50 dark:bg-yellow-900/20';
  if (score >= 13) return 'bg-blue-50 dark:bg-blue-900/20';
  if (score >= 11) return 'bg-green-50 dark:bg-green-900/20';
  return '';
};

const parseHTML = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const rows = Array.from(doc.querySelectorAll('table tr'));
  if (!rows.length) return [];
  const headers = Array.from(rows[0].querySelectorAll('th')).map(th => th.textContent.trim());
  if (!headers.length) return [];
  return rows.slice(1).reduce((acc, row) => {
    const cells = Array.from(row.querySelectorAll('td'));
    if (!cells.length) return acc;
    const player = {};
    headers.forEach((h, i) => { player[h] = cells[i]?.textContent.trim() || ''; });
    if (player['Name']) acc.push(player);
    return acc;
  }, []);
};

// All roles sorted alphabetically by display name
const ALL_ROLE_OPTIONS = Object.entries(ROLE_NAMES)
  .sort((a, b) => a[1].localeCompare(b[1]))
  .map(([key, label]) => ({ key, label }));

// Role picker dropdown component
const RolePicker = ({ selectedRoles, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = useMemo(() =>
    ALL_ROLE_OPTIONS.filter(r =>
      !selectedRoles.includes(r.key) &&
      r.label.toLowerCase().includes(search.toLowerCase())
    ),
    [selectedRoles, search]
  );

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Role
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-30 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search roles..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-400 dark:text-gray-500 text-center">No roles found</div>
            ) : (
              filtered.map(r => (
                <button
                  key={r.key}
                  onClick={() => { onAdd(r.key); setOpen(false); setSearch(''); }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500 mr-2">{r.key}</span>
                  {r.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ScoutingPool = () => {
  const { addPlanningScout, planningScouts } = useSquad();
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [sortRole, setSortRole] = useState(null); // role key to sort by, or null

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseHTML(e.target.result);
      setPlayers(parsed);
      setSearch('');
    };
    reader.readAsText(file);
  }, []);

  const addRole = (roleKey) => {
    setSelectedRoles(prev => [...prev, roleKey]);
    if (!sortRole) setSortRole(roleKey); // auto-sort by first added role
  };

  const removeRole = (roleKey) => {
    setSelectedRoles(prev => {
      const next = prev.filter(r => r !== roleKey);
      if (sortRole === roleKey) setSortRole(next[0] || null);
      return next;
    });
  };

  const toggleSort = (roleKey) => {
    setSortRole(prev => prev === roleKey ? null : roleKey);
  };

  // Compute scores for all selected roles + apply search + sort
  const displayedPlayers = useMemo(() => {
    let result = players.filter(p =>
      !search ||
      p['Name']?.toLowerCase().includes(search.toLowerCase()) ||
      p['Club']?.toLowerCase().includes(search.toLowerCase())
    );

    // Attach scores for each selected role
    result = result.map(p => {
      const scores = {};
      selectedRoles.forEach(role => {
        const formula = ROLE_FORMULAS[role];
        scores[role] = formula ? formula(p) : null;
      });
      return { ...p, _scores: scores };
    });

    // Sort by selected sort role descending
    if (sortRole && ROLE_FORMULAS[sortRole]) {
      result.sort((a, b) => (b._scores[sortRole] || 0) - (a._scores[sortRole] || 0));
    }

    return result;
  }, [players, search, selectedRoles, sortRole]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Scouting Pool</h1>
        {players.length > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {displayedPlayers.length} / {players.length} players
          </span>
        )}
      </div>

      {players.length === 0 ? (
        <div
          className={`border-2 border-dashed rounded-xl p-16 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Upload FM24 Scouting Export
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            In FM24: go to your scouting list → right-click a column header → Print to HTML, then upload that file here
          </p>
          <label className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg transition-colors text-sm font-medium">
            Browse File
            <input
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>
        </div>
      ) : (
        <>
          {/* Role selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Tactic Roles
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                — select the roles in your formation to see fit scores
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedRoles.map(roleKey => (
                <div
                  key={roleKey}
                  className={`flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg border text-sm font-medium cursor-pointer select-none transition-colors ${
                    sortRole === roleKey
                      ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-400 dark:border-primary-600 text-primary-700 dark:text-primary-300'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600'
                  }`}
                  onClick={() => toggleSort(roleKey)}
                  title={`${ROLE_NAMES[roleKey]}${sortRole === roleKey ? ' · sorting by this role' : ' · click to sort'}`}
                >
                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{roleKey}</span>
                  <span>{ROLE_NAMES[roleKey]}</span>
                  {sortRole === roleKey && (
                    <ArrowUpDown className="w-3 h-3 text-primary-500" />
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeRole(roleKey); }}
                    className="ml-0.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <RolePicker selectedRoles={selectedRoles} onAdd={addRole} />
              {selectedRoles.length > 0 && (
                <button
                  onClick={() => { setSelectedRoles([]); setSortRole(null); }}
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors px-1"
                >
                  Clear all
                </button>
              )}
            </div>
            {selectedRoles.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                No roles selected — add the roles from your tactic above to compare scores
              </p>
            )}
          </div>

          {/* Search + clear */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or club..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={() => { setPlayers([]); setSearch(''); setSelectedRoles([]); setSortRole(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 border border-gray-300 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500 transition-colors"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Plan</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Position</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Age</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Nat</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Club</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Value</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Salary</th>
                    {selectedRoles.map(role => (
                      <th
                        key={role}
                        className={`px-3 py-3 text-center font-semibold whitespace-nowrap cursor-pointer select-none transition-colors ${
                          sortRole === role
                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                            : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
                        }`}
                        onClick={() => toggleSort(role)}
                        title={`${ROLE_NAMES[role]} — click to sort`}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{role}</span>
                          <span className="text-xs">{ROLE_NAMES[role]}</span>
                          {sortRole === role && <ArrowUpDown className="w-3 h-3 text-primary-500" />}
                        </div>
                      </th>
                    ))}
                    {selectedRoles.length === 0 && (
                      <th className="px-4 py-3 text-center font-semibold text-gray-400 dark:text-gray-500 whitespace-nowrap italic text-xs">
                        ← add roles to see scores
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {displayedPlayers.map((player, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-3 py-3 text-center">
                        {planningScouts.some(s => s['Name'] === player['Name']) ? (
                          <BookmarkCheck className="w-4 h-4 text-purple-500 dark:text-purple-400 mx-auto" title="Added to Squad Plan" />
                        ) : (
                          <button
                            onClick={() => addPlanningScout(player)}
                            className="text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 transition-colors mx-auto block"
                            title="Add to Squad Plan"
                          >
                            <BookmarkPlus className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {player['Name']}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-36 truncate" title={player['Position']}>
                        {player['Position']}
                      </td>
                      <td className="px-3 py-3 text-gray-700 dark:text-gray-300 text-center">
                        {player['Age']}
                      </td>
                      <td className="px-3 py-3 text-gray-700 dark:text-gray-300 text-center">
                        {player['Nat']}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {player['Club']}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                        {player['Transfer Value']}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                        {player['Salary']}
                      </td>
                      {selectedRoles.map(role => {
                        const score = player._scores?.[role];
                        return (
                          <td
                            key={role}
                            className={`px-3 py-3 text-center font-bold whitespace-nowrap ${getRoleScoreColor(score)} ${sortRole === role ? getRoleScoreBg(score) : ''}`}
                          >
                            {score != null ? score.toFixed(1) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>

              {displayedPlayers.length === 0 && (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  No players match the current filters
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScoutingPool;
