import React, { useState, useCallback, useMemo } from 'react';
import { Upload, Search, X } from 'lucide-react';
import { ROLE_NAMES, ROLE_FORMULAS } from '../utils/roleCalculations';

const KEY_ATTRS = ['Pac', 'Acc', 'Sta', 'Str', 'Dri', 'Fin', 'Pas', 'Tck', 'Mar', 'Pos', 'Ant', 'Dec', 'Vis', 'Wor', 'Tec'];

const getAttrColor = (value) => {
  const n = parseInt(value);
  if (isNaN(n)) return 'text-gray-400 dark:text-gray-600';
  if (n >= 18) return 'text-yellow-500 dark:text-yellow-400';
  if (n >= 15) return 'text-blue-500 dark:text-blue-400';
  if (n >= 12) return 'text-green-600 dark:text-green-400';
  if (n >= 8)  return 'text-gray-600 dark:text-gray-300';
  return 'text-red-500 dark:text-red-400';
};

const getRoleScoreColor = (score) => {
  if (score >= 15) return 'text-yellow-500 dark:text-yellow-400';
  if (score >= 13) return 'text-blue-500 dark:text-blue-400';
  if (score >= 11) return 'text-green-600 dark:text-green-400';
  if (score >= 8)  return 'text-gray-600 dark:text-gray-300';
  return 'text-red-500 dark:text-red-400';
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

// Build sorted role options: "All" first, then all roles alphabetically by display name
const ROLE_OPTIONS = [
  { key: 'All', label: 'All Roles' },
  ...Object.entries(ROLE_NAMES)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([key, label]) => ({ key, label }))
];

const ScoutingPool = () => {
  const [players, setPlayers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseHTML(e.target.result);
      setPlayers(parsed);
      setRoleFilter('All');
      setSearch('');
    };
    reader.readAsText(file);
  }, []);

  const displayedPlayers = useMemo(() => {
    let result = players.filter(p =>
      !search ||
      p['Name']?.toLowerCase().includes(search.toLowerCase()) ||
      p['Club']?.toLowerCase().includes(search.toLowerCase())
    );

    if (roleFilter !== 'All' && ROLE_FORMULAS[roleFilter]) {
      const formula = ROLE_FORMULAS[roleFilter];
      result = result
        .map(p => ({ ...p, _roleScore: formula(p) }))
        .sort((a, b) => b._roleScore - a._roleScore);
    } else {
      result = result.map(p => ({ ...p, _roleScore: null }));
    }

    return result;
  }, [players, roleFilter, search]);

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
          {/* Filters */}
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
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {ROLE_OPTIONS.map(({ key, label }) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button
              onClick={() => { setPlayers([]); setSearch(''); setRoleFilter('All'); }}
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
                    {roleFilter !== 'All' && (
                      <th className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Score</th>
                    )}
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Position</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Age</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Nat</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Club</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Value</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Salary</th>
                    {KEY_ATTRS.map(a => (
                      <th key={a} className="px-2 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {displayedPlayers.map((player, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      {roleFilter !== 'All' && (
                        <td className={`px-3 py-3 text-center font-bold whitespace-nowrap ${getRoleScoreColor(player._roleScore)}`}>
                          {player._roleScore != null ? player._roleScore.toFixed(1) : '-'}
                        </td>
                      )}
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {player['Name']}
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-36 truncate" title={player['Position']}>
                        {player['Position']}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-center">
                        {player['Age']}
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
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
                      {KEY_ATTRS.map(attr => (
                        <td key={attr} className={`px-2 py-3 text-center font-bold ${getAttrColor(player[attr])}`}>
                          {player[attr] || '-'}
                        </td>
                      ))}
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
