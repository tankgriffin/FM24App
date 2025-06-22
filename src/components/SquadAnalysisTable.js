import React, { useRef, useEffect, useState } from 'react';
import { ROLE_NAMES, normalizeGoalkeeperScore } from '../utils/roleCalculations';
import { SortAsc, SortDesc } from 'lucide-react';

function getScoreColor(score) {
  if (score >= 14) return 'text-yellow-400 dark:text-yellow-300';
  if (score >= 12) return 'text-blue-600 dark:text-blue-400';
  if (score >= 11) return 'text-green-600 dark:text-green-400';
  if (score >= 10) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-orange-600 dark:text-orange-400';
}
function getFootStrengthColor(strength) {
  const strengthText = strength?.toLowerCase() || '';
  let value = 0;
  if (strengthText.includes('very strong') || strengthText.includes('strong')) value = 13;
  else if (strengthText.includes('fairly strong')) value = 11;
  else if (strengthText.includes('reasonable')) value = 10;
  else if (strengthText.includes('weak')) value = 8;
  else if (strengthText.includes('very weak')) value = 6;
  else value = 0;
  if (value >= 12) return 'text-blue-600 dark:text-blue-400';
  if (value >= 11) return 'text-green-600 dark:text-green-400';
  if (value >= 10) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-orange-600 dark:text-orange-400';
}

const SquadAnalysisTable = ({ players, preferredRoles }) => {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const tableScrollRef = useRef(null);
  const fakeScrollRef = useRef(null);

  // Sync the fake scrollbar with the table
  useEffect(() => {
    const table = tableScrollRef.current;
    const fake = fakeScrollRef.current;
    if (!table || !fake) return;
    const handleTableScroll = () => { fake.scrollLeft = table.scrollLeft; };
    const handleFakeScroll = () => { table.scrollLeft = fake.scrollLeft; };
    table.addEventListener('scroll', handleTableScroll);
    fake.addEventListener('scroll', handleFakeScroll);
    return () => {
      table.removeEventListener('scroll', handleTableScroll);
      fake.removeEventListener('scroll', handleFakeScroll);
    };
  }, []);

  // Sort players
  const sortedPlayers = [...players].sort((a, b) => {
    let aValue, bValue;
    if (sortBy === 'name') {
      aValue = a.Name || '';
      bValue = b.Name || '';
    } else if (sortBy === 'position') {
      aValue = a.Position || '';
      bValue = b.Position || '';
    } else if (sortBy === 'age') {
      aValue = parseInt(a.Age) || 0;
      bValue = parseInt(b.Age) || 0;
    } else if (preferredRoles.includes(sortBy)) {
      aValue = sortBy === 'GK' ? normalizeGoalkeeperScore(a.roleScores?.GK || 0) : a.roleScores?.[sortBy] || 0;
      bValue = sortBy === 'GK' ? normalizeGoalkeeperScore(b.roleScores?.GK || 0) : b.roleScores?.[sortBy] || 0;
    } else if (sortBy === 'height') {
      aValue = a.Height || '';
      bValue = b.Height || '';
    } else if (sortBy === 'personality') {
      aValue = a.Personality || '';
      bValue = b.Personality || '';
    } else if (sortBy === 'leftFoot') {
      aValue = a.LeftFoot || '';
      bValue = b.LeftFoot || '';
    } else if (sortBy === 'rightFoot') {
      aValue = a.RightFoot || '';
      bValue = b.RightFoot || '';
    } else if (sortBy === 'tags') {
      aValue = (a.roleTag || '') + (a.planTag || '');
      bValue = (b.roleTag || '') + (b.planTag || '');
    } else {
      aValue = '';
      bValue = '';
    }
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return (
    <div className="relative mt-8">
      <div ref={tableScrollRef} className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('name'); }}>Name {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { if (sortBy === 'position') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('position'); }}>Position {sortBy === 'position' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { if (sortBy === 'age') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('age'); }}>Age {sortBy === 'age' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}</th>
              {preferredRoles.map(role => (
                <th key={role} className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { if (sortBy === role) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy(role); }}>{ROLE_NAMES[role] || role} {sortBy === role && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}</th>
              ))}
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { if (sortBy === 'height') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('height'); }}>Height {sortBy === 'height' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { if (sortBy === 'personality') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('personality'); }}>Personality {sortBy === 'personality' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { if (sortBy === 'leftFoot') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('leftFoot'); }}>Left Foot {sortBy === 'leftFoot' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { if (sortBy === 'rightFoot') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('rightFoot'); }}>Right Foot {sortBy === 'rightFoot' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => { if (sortBy === 'tags') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); setSortBy('tags'); }}>Tags {sortBy === 'tags' && (sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {sortedPlayers.map(player => (
              <tr key={player.id}>
                <td className="px-4 py-2 whitespace-nowrap font-semibold text-gray-900 dark:text-white">{player.Name || 'Unknown Player'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{player.Position}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{player.Age}</td>
                {preferredRoles.map(role => {
                  const roleScore = role === 'GK' ? normalizeGoalkeeperScore(player.roleScores?.GK || 0) : player.roleScores?.[role] || 0;
                  return (
                    <td key={role} className={`px-4 py-2 whitespace-nowrap font-semibold ${getScoreColor(roleScore)}`}>{roleScore > 0 ? roleScore : ''}</td>
                  );
                })}
                <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{player.Height || 'N/A'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{player.Personality || 'N/A'}</td>
                <td className={`px-4 py-2 whitespace-nowrap font-semibold ${getFootStrengthColor(player.LeftFoot)}`}>{player.LeftFoot || 'N/A'}</td>
                <td className={`px-4 py-2 whitespace-nowrap font-semibold ${getFootStrengthColor(player.RightFoot)}`}>{player.RightFoot || 'N/A'}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {player.roleTag && (
                    <span className="inline-block text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold mr-1">
                      {player.roleTag}
                    </span>
                  )}
                  {player.planTag && (
                    <span className="inline-block text-xs px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-semibold">
                      {player.planTag}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Sticky fake scrollbar */}
      <div ref={fakeScrollRef} className="sticky left-0 right-0 bottom-0 h-5 overflow-x-auto custom-scrollbar bg-transparent z-20" style={{ WebkitOverflowScrolling: 'touch' }} aria-hidden="true">
        <div style={{ width: tableScrollRef.current ? tableScrollRef.current.scrollWidth : '2000px', height: 1 }} />
      </div>
    </div>
  );
};

export default SquadAnalysisTable; 