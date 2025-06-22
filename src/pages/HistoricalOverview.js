import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSquad } from '../contexts/SquadContext';
import { useTactics } from '../contexts/TacticsContext';
import { normalizeGoalkeeperScore, ROLE_NAMES } from '../utils/roleCalculations';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Users,
  BarChart3,
  Plus,
  Trash2,
  SortAsc,
  SortDesc
} from 'lucide-react';

const HistoricalOverview = () => {
  const { 
    seasons, 
    currentSeason, 
    createNewSeason, 
    switchToSeason, 
    getSeasonData, 
    getAllSeasons,
    getPlayerHistory,
    clearAllHistoricalData
  } = useSquad();
  const { preferredRoles } = useTactics();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [overviewSortBy, setOverviewSortBy] = useState('name');
  const [overviewSortOrder, setOverviewSortOrder] = useState('asc');
  const [seasonSortBy, setSeasonSortBy] = useState('name');
  const [seasonSortOrder, setSeasonSortOrder] = useState('asc');
  const tableScrollRef = useRef(null);
  const fakeScrollRef = useRef(null);

  // Sync the fake scrollbar with the table
  useEffect(() => {
    const table = tableScrollRef.current;
    const fake = fakeScrollRef.current;
    if (!table || !fake) return;
    const handleTableScroll = () => {
      fake.scrollLeft = table.scrollLeft;
    };
    const handleFakeScroll = () => {
      table.scrollLeft = fake.scrollLeft;
    };
    table.addEventListener('scroll', handleTableScroll);
    fake.addEventListener('scroll', handleFakeScroll);
    return () => {
      table.removeEventListener('scroll', handleTableScroll);
      fake.removeEventListener('scroll', handleFakeScroll);
    };
  }, [activeTab]);

  const allSeasons = getAllSeasons();
  const availableTabs = [
    'overview',
    ...allSeasons.map(s => `season-${s.season}`)
  ];

  const getScoreColor = (score) => {
    if (score >= 14) return 'text-yellow-400 dark:text-yellow-300'; // gold
    if (score >= 12) return 'text-blue-600 dark:text-blue-400';
    if (score >= 11) return 'text-green-600 dark:text-green-400';
    if (score >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getChangeIndicator = (oldScore, newScore) => {
    if (!oldScore || !newScore) return <Minus className="w-4 h-4 text-gray-400" />;
    const diff = newScore - oldScore;
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeText = (oldScore, newScore) => {
    if (!oldScore || !newScore) return 'N/A';
    const diff = newScore - oldScore;
    if (diff > 0) return `+${diff}`;
    if (diff < 0) return `${diff}`;
    return '0';
  };

  const getChangeColor = (oldScore, newScore) => {
    if (!oldScore || !newScore) return 'text-gray-400';
    const diff = newScore - oldScore;
    if (diff > 0) return 'text-green-600 dark:text-green-400';
    if (diff < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Get all unique players across all seasons
  const allPlayers = useMemo(() => {
    const playerMap = new Map();
    allSeasons.forEach(season => {
      season.players.forEach(player => {
        if (!playerMap.has(player.Name)) {
          playerMap.set(player.Name, {
            name: player.Name,
            position: player.Position,
            firstSeen: season.season,
            lastSeen: season.season,
            seasons: [season.season]
          });
        } else {
          const existing = playerMap.get(player.Name);
          existing.lastSeen = season.season;
          existing.seasons.push(season.season);
        }
      });
    });
    return Array.from(playerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [allSeasons]);

  // Get overview data showing changes from first to last season
  const overviewData = useMemo(() => {
    if (allSeasons.length < 2) return [];
    const firstSeason = allSeasons[0];
    const lastSeason = allSeasons[allSeasons.length - 1];
    return allPlayers.map(player => {
      const firstSeasonPlayer = firstSeason.players.find(p => p.Name === player.name);
      const lastSeasonPlayer = lastSeason.players.find(p => p.Name === player.name);
      const changes = {};
      preferredRoles.forEach(role => {
        const firstScore = role === 'GK' 
          ? (firstSeasonPlayer ? normalizeGoalkeeperScore(firstSeasonPlayer.roleScores?.GK || 0) : 0)
          : (firstSeasonPlayer?.roleScores?.[role] || 0);
        const lastScore = role === 'GK'
          ? (lastSeasonPlayer ? normalizeGoalkeeperScore(lastSeasonPlayer.roleScores?.GK || 0) : 0)
          : (lastSeasonPlayer?.roleScores?.[role] || 0);
        changes[role] = {
          first: firstScore,
          last: lastScore,
          change: lastScore - firstScore
        };
      });
      return {
        ...player,
        changes,
        firstSeasonPlayer,
        lastSeasonPlayer
      };
    });
  }, [allPlayers, allSeasons, preferredRoles]);

  // Sort overview data
  const sortedOverviewData = useMemo(() => {
    const data = [...overviewData];
    data.sort((a, b) => {
      let aValue, bValue;
      if (overviewSortBy === 'name') {
        aValue = a.name || '';
        bValue = b.name || '';
      } else if (overviewSortBy === 'position') {
        aValue = a.position || '';
        bValue = b.position || '';
      } else if (overviewSortBy === 'seasons') {
        aValue = a.seasons.length;
        bValue = b.seasons.length;
      } else if (preferredRoles.includes(overviewSortBy)) {
        aValue = a.changes[overviewSortBy]?.last || 0;
        bValue = b.changes[overviewSortBy]?.last || 0;
      } else {
        aValue = '';
        bValue = '';
      }
      if (overviewSortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    return data;
  }, [overviewData, overviewSortBy, overviewSortOrder, preferredRoles]);

  // Sort season data
  const getSortedSeasonPlayers = (seasonData) => {
    if (!seasonData) return [];
    const data = [...seasonData.players];
    data.sort((a, b) => {
      let aValue, bValue;
      if (seasonSortBy === 'name') {
        aValue = a.Name || '';
        bValue = b.Name || '';
      } else if (seasonSortBy === 'position') {
        aValue = a.Position || '';
        bValue = b.Position || '';
      } else if (seasonSortBy === 'age') {
        aValue = parseInt(a.Age) || 0;
        bValue = parseInt(b.Age) || 0;
      } else if (preferredRoles.includes(seasonSortBy)) {
        aValue = seasonSortBy === 'GK'
          ? normalizeGoalkeeperScore(a.roleScores?.GK || 0)
          : a.roleScores?.[seasonSortBy] || 0;
        bValue = seasonSortBy === 'GK'
          ? normalizeGoalkeeperScore(b.roleScores?.GK || 0)
          : b.roleScores?.[seasonSortBy] || 0;
      } else {
        aValue = '';
        bValue = '';
      }
      if (seasonSortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    return data;
  };

  const renderSeasonTab = (seasonNumber) => {
    const seasonData = getSeasonData(seasonNumber);
    if (!seasonData) return null;
    const sortedPlayers = getSortedSeasonPlayers(seasonData);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Season {seasonNumber}
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {new Date(seasonData.created).toLocaleDateString()}
          </div>
        </div>
        <div className="relative">
          <div ref={tableScrollRef} className="overflow-x-auto custom-scrollbar hide-native-scrollbar">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      if (seasonSortBy === 'name') setSeasonSortOrder(seasonSortOrder === 'asc' ? 'desc' : 'asc');
                      setSeasonSortBy('name');
                    }}
                  >
                    Player {seasonSortBy === 'name' && (seasonSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      if (seasonSortBy === 'position') setSeasonSortOrder(seasonSortOrder === 'asc' ? 'desc' : 'asc');
                      setSeasonSortBy('position');
                    }}
                  >
                    Position {seasonSortBy === 'position' && (seasonSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      if (seasonSortBy === 'age') setSeasonSortOrder(seasonSortOrder === 'asc' ? 'desc' : 'asc');
                      setSeasonSortBy('age');
                    }}
                  >
                    Age {seasonSortBy === 'age' && (seasonSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                  </th>
                  {preferredRoles.map(role => (
                    <th
                      key={role}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        if (seasonSortBy === role) setSeasonSortOrder(seasonSortOrder === 'asc' ? 'desc' : 'asc');
                        setSeasonSortBy(role);
                      }}
                    >
                      {ROLE_NAMES[role] || role} {seasonSortBy === role && (seasonSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedPlayers.map(player => (
                  <tr key={player.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-white">{player.Name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{player.Position}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{player.Age}</td>
                    {preferredRoles.map(role => {
                      const roleScore = role === 'GK'
                        ? normalizeGoalkeeperScore(player.roleScores?.GK || 0)
                        : player.roleScores?.[role] || 0;
                      return (
                        <td key={role} className={`px-4 py-2 whitespace-nowrap font-semibold ${getScoreColor(roleScore)}`}>{roleScore > 0 ? roleScore : ''}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Sticky fake scrollbar */}
          <div
            ref={fakeScrollRef}
            className="sticky left-0 right-0 bottom-0 h-5 overflow-x-auto custom-scrollbar bg-transparent z-20"
            style={{ WebkitOverflowScrolling: 'touch' }}
            aria-hidden="true"
          >
            <div style={{ width: tableScrollRef.current ? tableScrollRef.current.scrollWidth : '2000px', height: 1 }} />
          </div>
        </div>
      </div>
    );
  };

  const renderOverviewTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Development Overview
          </h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Changes from Season {allSeasons[0]?.season || 1} to Season {allSeasons[allSeasons.length - 1]?.season || 1}
          </div>
        </div>
        <div className="relative">
          <div ref={tableScrollRef} className="overflow-x-auto custom-scrollbar hide-native-scrollbar">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      if (overviewSortBy === 'name') setOverviewSortOrder(overviewSortOrder === 'asc' ? 'desc' : 'asc');
                      setOverviewSortBy('name');
                    }}
                  >
                    Player {overviewSortBy === 'name' && (overviewSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      if (overviewSortBy === 'position') setOverviewSortOrder(overviewSortOrder === 'asc' ? 'desc' : 'asc');
                      setOverviewSortBy('position');
                    }}
                  >
                    Position {overviewSortBy === 'position' && (overviewSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                  </th>
                  <th
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      if (overviewSortBy === 'seasons') setOverviewSortOrder(overviewSortOrder === 'asc' ? 'desc' : 'asc');
                      setOverviewSortBy('seasons');
                    }}
                  >
                    Seasons {overviewSortBy === 'seasons' && (overviewSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                  </th>
                  {preferredRoles.map(role => (
                    <th
                      key={role}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => {
                        if (overviewSortBy === role) setOverviewSortOrder(overviewSortOrder === 'asc' ? 'desc' : 'asc');
                        setOverviewSortBy(role);
                      }}
                    >
                      {ROLE_NAMES[role] || role} {overviewSortBy === role && (overviewSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedOverviewData.map(player => (
                  <tr key={player.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-white">{player.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{player.position}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{player.firstSeen}-{player.lastSeen}</td>
                    {preferredRoles.map(role => {
                      const change = player.changes[role];
                      return (
                        <td key={role} className="px-4 py-2 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`font-semibold ${getScoreColor(change.last)}`}>{change.last > 0 ? change.last : ''}</span>
                            {getChangeIndicator(change.first, change.last)}
                            <span className={`text-sm ${getChangeColor(change.first, change.last)}`}>{getChangeText(change.first, change.last)}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Sticky fake scrollbar */}
          <div
            ref={fakeScrollRef}
            className="sticky left-0 right-0 bottom-0 h-5 overflow-x-auto custom-scrollbar bg-transparent z-20"
            style={{ WebkitOverflowScrolling: 'touch' }}
            aria-hidden="true"
          >
            <div style={{ width: tableScrollRef.current ? tableScrollRef.current.scrollWidth : '2000px', height: 1 }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Historical Overview
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track player development across multiple seasons
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={createNewSeason}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Season
              </button>
              <button
                onClick={clearAllHistoricalData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>

        {/* Season Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Season:</span>
            <select
              value={currentSeason}
              onChange={(e) => switchToSeason(parseInt(e.target.value))}
              className="ml-2 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allSeasons.map(season => (
                <option key={season.season} value={season.season}>
                  Season {season.season}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {availableTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab === 'overview' ? 'Overview' : `Season ${tab.split('-')[1]}`}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {activeTab === 'overview' ? (
            renderOverviewTab()
          ) : (
            renderSeasonTab(parseInt(activeTab.split('-')[1]))
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Seasons</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{allSeasons.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unique Players</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{allPlayers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Season</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{currentSeason}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalOverview; 