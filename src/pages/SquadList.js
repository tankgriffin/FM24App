import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSquad } from '../contexts/SquadContext';
import { useTactics } from '../contexts/TacticsContext';
import { getBestRoleForPlayer, normalizeGoalkeeperScore, getKeyAttributesForRole, ROLE_NAMES, calculatePlayerRoleScores } from '../utils/roleCalculations';
import { 
  Upload, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  User,
  Star,
  X,
  FileText,
  Plus,
  Edit2
} from 'lucide-react';

const SquadList = () => {
  const { players, loading, importSquadData, clearSquadData, setPlayerTag, currentSeason, createNewSeason } = useSquad();
  const { preferredRoles } = useTactics();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [openTagMenu, setOpenTagMenu] = useState({});
  const [viewMode, setViewMode] = useState('tile'); // 'tile' or 'table'
  const [tableSortBy, setTableSortBy] = useState('name');
  const [tableSortOrder, setTableSortOrder] = useState('asc');

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
  }, [viewMode]);

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    let filtered = players.filter(player => {
      const matchesSearch = player.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      // Always show all players, regardless of selectedRole or score
      return matchesSearch;
    });

    // Sort players
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.Name || '';
          bValue = b.Name || '';
          break;
        case 'role':
          if (selectedRole && a.roleScores && b.roleScores) {
            aValue = a.roleScores[selectedRole] || 0;
            bValue = b.roleScores[selectedRole] || 0;
          } else {
            aValue = a.roleScores ? Math.max(...Object.values(a.roleScores)) : 0;
            bValue = b.roleScores ? Math.max(...Object.values(b.roleScores)) : 0;
          }
          break;
        case 'age':
          aValue = parseInt(a.Age) || 0;
          bValue = parseInt(b.Age) || 0;
          break;
        default:
          aValue = a[sortBy] ? parseInt(a[sortBy]) : 0;
          bValue = b[sortBy] ? parseInt(b[sortBy]) : 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [players, searchTerm, selectedRole, sortBy, sortOrder]);

  // Table sorting logic
  const sortedTablePlayers = useMemo(() => {
    const playersCopy = [...filteredPlayers];
    playersCopy.sort((a, b) => {
      let aValue, bValue;
      if (tableSortBy === 'name') {
        aValue = a.Name || '';
        bValue = b.Name || '';
      } else if (tableSortBy === 'position') {
        aValue = a.Position || '';
        bValue = b.Position || '';
      } else if (tableSortBy === 'age') {
        aValue = parseInt(a.Age) || 0;
        bValue = parseInt(b.Age) || 0;
      } else if (preferredRoles.includes(tableSortBy)) {
        aValue = tableSortBy === 'GK'
          ? normalizeGoalkeeperScore(a.roleScores?.GK || 0)
          : a.roleScores?.[tableSortBy] || 0;
        bValue = tableSortBy === 'GK'
          ? normalizeGoalkeeperScore(b.roleScores?.GK || 0)
          : b.roleScores?.[tableSortBy] || 0;
      } else if (tableSortBy === 'height') {
        aValue = a.Height || '';
        bValue = b.Height || '';
      } else if (tableSortBy === 'personality') {
        aValue = a.Personality || '';
        bValue = b.Personality || '';
      } else if (tableSortBy === 'leftFoot') {
        aValue = a.LeftFoot || '';
        bValue = b.LeftFoot || '';
      } else if (tableSortBy === 'rightFoot') {
        aValue = a.RightFoot || '';
        bValue = b.RightFoot || '';
      } else if (tableSortBy === 'tags') {
        aValue = (a.roleTag || '') + (a.planTag || '');
        bValue = (b.roleTag || '') + (b.planTag || '');
      } else {
        aValue = '';
        bValue = '';
      }
      if (tableSortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    return playersCopy;
  }, [filteredPlayers, tableSortBy, tableSortOrder, preferredRoles]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHtmlContent(e.target.result);
        setShowUploadDialog(true);
      };
      reader.readAsText(file);
    }
  };

  const handleImportData = async () => {
    try {
      await importSquadData(htmlContent);
      setShowUploadDialog(false);
      setHtmlContent('');
    } catch (error) {
      alert('Error importing squad data: ' + error.message);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 14) return 'text-yellow-400 dark:text-yellow-300'; // gold
    if (score >= 12) return 'text-blue-600 dark:text-blue-400';
    if (score >= 11) return 'text-green-600 dark:text-green-400';
    if (score >= 10) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getFootStrengthColor = (strength) => {
    // Map text values to numeric scale for color coding
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
  };

  // Create role categories for the filter
  const ROLE_CATEGORIES = {
    'Goalkeepers': ['GKD', 'SKD', 'SKS', 'SKA'],
    'Defenders': ['BPDD', 'BPDS', 'BPDC', 'CDD', 'CDS', 'CDC', 'CWBS', 'CWBA', 'FBD', 'FBS', 'FBA', 'IFBD', 'IWBD', 'IWBS', 'IWBA', 'LIBD', 'LIBS', 'NCB', 'NCBS', 'NCBC', 'NFB', 'WCB', 'WCBS', 'WCBA', 'WBD', 'WBS', 'WBA'],
    'Midfielders': ['APM', 'APMA', 'ANC', 'AM', 'AMA', 'BWM', 'BWMS', 'BBM', 'CAR', 'CMD', 'CMS', 'CMA', 'DLPD', 'DLPS', 'DM', 'DMS', 'DW', 'DWS', 'ENG', 'HB', 'IF', 'IFA', 'IW', 'IWA', 'MEZ', 'MEZA', 'RGA', 'RPM', 'SV', 'SVA', 'SS', 'WM', 'WMS', 'WMA', 'WPM', 'WPMA'],
    'Attackers': ['WTF', 'WTFA', 'WNG', 'WNGA', 'AF', 'CF', 'CFA', 'DLF', 'DLFA', 'F9', 'PF', 'PFS', 'PFA', 'P', 'TF', 'TFA', 'TQ', 'RMD']
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Squad Analysis
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Import and analyze your FM24 squad data
          </p>
          <div className="mt-2 flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Current Season: <span className="font-semibold text-gray-900 dark:text-white">Season {currentSeason}</span>
            </span>
            <button
              onClick={createNewSeason}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Season
            </button>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3 items-center">
          {/* View toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('tile')}
              className={`px-3 py-1 rounded-l-lg border border-gray-300 dark:border-gray-600 text-sm font-medium ${viewMode === 'tile' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Tile View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-r-lg border border-gray-300 dark:border-gray-600 text-sm font-medium ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'}`}
            >
              Table View
            </button>
          </div>
          {players.length > 0 && (
            <button
              onClick={clearSquadData}
              className="btn-secondary"
            >
              Clear Data
            </button>
          )}
          <label className="btn-primary cursor-pointer">
            <Upload className="w-4 h-4 inline mr-2" />
            Import Squad
            <input
              type="file"
              accept=".html,.htm"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Import
              </h3>
              <button
                onClick={() => setShowUploadDialog(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Ready to import squad data. This will replace any existing data.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  File size: {Math.round(htmlContent.length / 1024)} KB
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUploadDialog(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleImportData}
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {players.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Squad Data
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Import your Football Manager 2024 squad export (HTML format) to start analyzing your players and their role suitability.
          </p>
          <label className="btn-primary cursor-pointer">
            <Upload className="w-4 h-4 inline mr-2" />
            Upload Squad Export
            <input
              type="file"
              accept=".html,.htm"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <div className="mt-6 text-left max-w-md mx-auto">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How to export from FM24:
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>1. Go to Squad → Squad Overview</li>
              <li>2. Right-click on the player list</li>
              <li>3. Select "Export as HTML"</li>
              <li>4. Save the file and upload it here</li>
            </ol>
          </div>
        </div>
      ) : (
        <>
          {/* Filters and Search */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Role Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Selected Roles</option>
                    {preferredRoles.length > 0 ? (
                      preferredRoles.map(role => (
                          <option key={role} value={role}>
                          {ROLE_NAMES[role] || role}
                          </option>
                      ))
                    ) : (
                      <option disabled value="">No preferred roles selected</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center space-x-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="role">Best Role Score</option>
                  <option value="age">Age</option>
                  <option value="Position">Position</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredPlayers.length} of {players.length} players
            </div>
          </div>

          {/* Players Grid or Table */}
          {viewMode === 'tile' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => {
                // If a role is selected, show that role's score/attributes; else show best role
                let displayRole, roleScore, scoreMax, keyAttributes;
                if (selectedRole) {
                  displayRole = selectedRole;
                  roleScore = displayRole === 'GK'
                    ? normalizeGoalkeeperScore(player.roleScores?.GK || 0)
                    : player.roleScores?.[displayRole] || 0;
                  scoreMax = 20;
                  keyAttributes = getKeyAttributesForRole(displayRole);
                } else {
              const bestRole = getBestRoleForPlayer(player);
                  displayRole = bestRole.role;
                  roleScore = displayRole === 'GK'
                    ? normalizeGoalkeeperScore(player.roleScores?.GK || 0)
                    : player.roleScores?.[displayRole] || 0;
                  scoreMax = 20;
                  keyAttributes = getKeyAttributesForRole(displayRole);
                }
              return (
                <div
                  key={player.id}
                  className="player-card p-6"
                >
                    {/* Tag selectors (now as text + + button) */}
                    <div className="flex justify-end space-x-2 mb-2">
                      {/* Role Tag */}
                      <div className="relative">
                        {player.roleTag ? (
                          <span className="inline-flex items-center text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-semibold mr-1">
                            {player.roleTag}
                            <button
                              className="ml-1 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
                              onClick={() => setOpenTagMenu({ ...openTagMenu, [player.id]: openTagMenu[player.id] === 'role' ? null : 'role' })}
                              title="Edit Role Tag"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </span>
                        ) : (
                          <button
                            className="inline-flex items-center text-xs px-2 py-1 rounded bg-blue-50 dark:bg-blue-800 text-blue-700 dark:text-blue-200 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900"
                            onClick={() => setOpenTagMenu({ ...openTagMenu, [player.id]: openTagMenu[player.id] === 'role' ? null : 'role' })}
                            title="Add Role Tag"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Role
                          </button>
                        )}
                        {/* Role Tag Menu */}
                        {openTagMenu[player.id] === 'role' && (
                          <div className="absolute z-10 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs">
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                              onClick={() => { setPlayerTag(player.id, 'roleTag', 'Starter'); setOpenTagMenu({ ...openTagMenu, [player.id]: null }); }}
                            >Starter</button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                              onClick={() => { setPlayerTag(player.id, 'roleTag', 'Backup'); setOpenTagMenu({ ...openTagMenu, [player.id]: null }); }}
                            >Backup</button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                              onClick={() => { setPlayerTag(player.id, 'roleTag', 'Youngster'); setOpenTagMenu({ ...openTagMenu, [player.id]: null }); }}
                            >Youngster</button>
                            {player.roleTag && (
                              <button
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                                onClick={() => { setPlayerTag(player.id, 'roleTag', ''); setOpenTagMenu({ ...openTagMenu, [player.id]: null }); }}
                              >Remove Tag</button>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Plan Tag */}
                      <div className="relative">
                        {player.planTag ? (
                          <span className="inline-flex items-center text-xs px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 font-semibold mr-1">
                            {player.planTag}
                            <button
                              className="ml-1 p-0.5 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded"
                              onClick={() => setOpenTagMenu({ ...openTagMenu, [player.id]: openTagMenu[player.id] === 'plan' ? null : 'plan' })}
                              title="Edit Plan Tag"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </span>
                        ) : (
                          <button
                            className="inline-flex items-center text-xs px-2 py-1 rounded bg-yellow-50 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 font-semibold hover:bg-yellow-100 dark:hover:bg-yellow-900"
                            onClick={() => setOpenTagMenu({ ...openTagMenu, [player.id]: openTagMenu[player.id] === 'plan' ? null : 'plan' })}
                            title="Add Plan Tag"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Plan
                          </button>
                        )}
                        {/* Plan Tag Menu */}
                        {openTagMenu[player.id] === 'plan' && (
                          <div className="absolute z-10 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg text-xs">
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                              onClick={() => { setPlayerTag(player.id, 'planTag', 'To Loan'); setOpenTagMenu({ ...openTagMenu, [player.id]: null }); }}
                            >To Loan</button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                              onClick={() => { setPlayerTag(player.id, 'planTag', 'To Sell'); setOpenTagMenu({ ...openTagMenu, [player.id]: null }); }}
                            >To Sell</button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-yellow-100 dark:hover:bg-yellow-900"
                              onClick={() => { setPlayerTag(player.id, 'planTag', 'Contract Expiring'); setOpenTagMenu({ ...openTagMenu, [player.id]: null }); }}
                            >Contract Expiring</button>
                            {player.planTag && (
                              <button
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                                onClick={() => { setPlayerTag(player.id, 'planTag', ''); setOpenTagMenu({ ...openTagMenu, [player.id]: null }); }}
                              >Remove Tag</button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {player.Name || 'Unknown Player'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {player.Position} • Age {player.Age}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(roleScore)}`}>
                        {roleScore}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Star className="w-3 h-3 mr-1" />
                        Role Score
                      </div>
                    </div>
                  </div>

                  {/* Best Role */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                          {selectedRole ? ROLE_NAMES[selectedRole] : `Best: ${ROLE_NAMES[displayRole] || displayRole}`}
                      </span>
                        <span className={`font-bold ${getScoreColor(roleScore)}`}>
                          {roleScore}/{scoreMax}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                            roleScore >= 14 ? 'bg-yellow-400' :
                            roleScore >= 12 ? 'bg-blue-600' :
                            roleScore >= 11 ? 'bg-green-600' :
                            roleScore >= 10 ? 'bg-yellow-600' :
                            'bg-orange-600'
                        }`}
                          style={{ width: `${(roleScore / scoreMax) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                    {/* Preferred Roles */}
                    <div className="space-y-2 h-60 overflow-y-auto flex flex-col justify-start">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        Preferred Roles:
                    </h4>
                      {preferredRoles.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                          {preferredRoles
                            .map((role) => {
                              const roleScore = role === 'GK' 
                                ? normalizeGoalkeeperScore(player.roleScores?.GK || 0)
                                : player.roleScores?.[role] || 0;
                              return { role, roleScore };
                            })
                            .filter(({ roleScore }) => roleScore >= 10)
                            .map(({ role, roleScore }) => (
                              <div key={role} className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">{ROLE_NAMES[role] || role}</span>
                                <span className={`font-medium ${getScoreColor(roleScore)}`}>
                                  {roleScore}
                          </span>
                        </div>
                      ))}
                    </div>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          No preferred roles set. Go to Dashboard to select your preferred roles.
                        </div>
                      )}
                  </div>

                    {/* Player Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {player.Height || 'N/A'}
                        </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Height</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {player.Personality || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Personality</div>
                        </div>
                        <div>
                          <div className={`text-lg font-semibold ${getFootStrengthColor(player.LeftFoot)}`}>
                            {player.LeftFoot || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Left Foot</div>
                      </div>
                      <div>
                          <div className={`text-lg font-semibold ${getFootStrengthColor(player.RightFoot)}`}>
                            {player.RightFoot || 'N/A'}
                        </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Right Foot</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          ) : (
            <div className="relative">
              <div ref={tableScrollRef} className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          if (tableSortBy === 'name') setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
                          setTableSortBy('name');
                        }}
                      >
                        Name {tableSortBy === 'name' && (tableSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          if (tableSortBy === 'position') setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
                          setTableSortBy('position');
                        }}
                      >
                        Position {tableSortBy === 'position' && (tableSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          if (tableSortBy === 'age') setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
                          setTableSortBy('age');
                        }}
                      >
                        Age {tableSortBy === 'age' && (tableSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                      </th>
                      {preferredRoles.map(role => (
                        <th
                          key={role}
                          className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            if (tableSortBy === role) setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
                            setTableSortBy(role);
                          }}
                        >
                          {ROLE_NAMES[role] || role} {tableSortBy === role && (tableSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                        </th>
                      ))}
                      <th
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          if (tableSortBy === 'height') setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
                          setTableSortBy('height');
                        }}
                      >
                        Height {tableSortBy === 'height' && (tableSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          if (tableSortBy === 'personality') setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
                          setTableSortBy('personality');
                        }}
                      >
                        Personality {tableSortBy === 'personality' && (tableSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          if (tableSortBy === 'leftFoot') setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
                          setTableSortBy('leftFoot');
                        }}
                      >
                        Left Foot {tableSortBy === 'leftFoot' && (tableSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          if (tableSortBy === 'rightFoot') setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
                          setTableSortBy('rightFoot');
                        }}
                      >
                        Right Foot {tableSortBy === 'rightFoot' && (tableSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                      </th>
                      <th
                        className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          if (tableSortBy === 'tags') setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
                          setTableSortBy('tags');
                        }}
                      >
                        Tags {tableSortBy === 'tags' && (tableSortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />)}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {sortedTablePlayers.map(player => (
                      <tr key={player.id}>
                        <td className="px-4 py-2 whitespace-nowrap font-semibold text-gray-900 dark:text-white">{player.Name || 'Unknown Player'}</td>
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
              <div
                ref={fakeScrollRef}
                className="sticky left-0 right-0 bottom-0 h-5 overflow-x-auto custom-scrollbar bg-transparent z-20"
                style={{ WebkitOverflowScrolling: 'touch' }}
                aria-hidden="true"
              >
                <div style={{ width: tableScrollRef.current ? tableScrollRef.current.scrollWidth : '2000px', height: 1 }} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SquadList;