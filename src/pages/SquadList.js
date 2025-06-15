import React, { useState, useMemo } from 'react';
import { useSquad } from '../contexts/SquadContext';
import { ROLE_CATEGORIES, ROLE_NAMES } from '../utils/roleCalculations';
import { 
  Upload, 
  Search, 
  Filter,
  SortAsc,
  SortDesc,
  User,
  Star,
  X,
  FileText
} from 'lucide-react';

const SquadList = () => {
  const { players, loading, importSquadData, clearSquadData } = useSquad();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    let filtered = players.filter(player => {
      const matchesSearch = player.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesRole = !selectedRole || (player.roleScores && player.roleScores[selectedRole] > 0);
      return matchesSearch && matchesRole;
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

  const getBestRoleForPlayer = (player) => {
    if (!player.roleScores) return { role: 'Unknown', score: 0 };
    
    const bestRole = Object.entries(player.roleScores).reduce((best, [role, score]) => {
      return score > best.score ? { role, score } : best;
    }, { role: '', score: 0 });
    
    return bestRole;
  };

  const getRoleColor = (score) => {
    if (score >= 18) return 'text-green-600 dark:text-green-400';
    if (score >= 15) return 'text-blue-600 dark:text-blue-400';
    if (score >= 12) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 10) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
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
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
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
                    <option value="">All Roles</option>
                    {Object.entries(ROLE_CATEGORIES).map(([category, roles]) => (
                      <optgroup key={category} label={category}>
                        {roles.map(role => (
                          <option key={role} value={role}>
                            {ROLE_NAMES[role]}
                          </option>
                        ))}
                      </optgroup>
                    ))}
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

          {/* Players Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlayers.map((player) => {
              const bestRole = getBestRoleForPlayer(player);
              const roleScore = selectedRole && player.roleScores ? 
                player.roleScores[selectedRole] : bestRole.score;
              
              return (
                <div
                  key={player.id}
                  className="player-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
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
                      <div className={`text-lg font-bold ${getRoleColor(roleScore)}`}>
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
                        {selectedRole ? ROLE_NAMES[selectedRole] : `Best: ${ROLE_NAMES[bestRole.role]}`}
                      </span>
                      <span className={`font-bold ${getRoleColor(roleScore)}`}>
                        {roleScore}/20
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          roleScore >= 15 ? 'bg-green-500' :
                          roleScore >= 12 ? 'bg-blue-500' :
                          roleScore >= 10 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(roleScore / 20) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Key Attributes */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                      Key Attributes:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {['Pace', 'Technique', 'Passing', 'Finishing'].map((attr) => (
                        <div key={attr} className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{attr}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {player[attr] || '-'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Derived Stats */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {player.Spd || 0}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Speed</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {player.Work || 0}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Work</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {player.SetP || 0}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Set P.</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SquadList;