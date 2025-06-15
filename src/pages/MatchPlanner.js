import React, { useState } from 'react';
import { useTactics } from '../contexts/TacticsContext';
import { Plus, Calendar, Edit, Trash2, Home, Plane, MapPin, Target, Users, BookOpen } from 'lucide-react';

// Tactical philosophies
const TACTICAL_PHILOSOPHIES = [
  'Possession-based',
  'Counter-attacking',
  'High pressing',
  'Defensive',
  'Direct play',
  'Tiki-taka',
  'Gegenpressing',
  'Park the bus',
  'Wing play',
  'Through the middle',
  'Long ball',
  'Quick transitions'
];

// Common opponent formations
const OPPONENT_FORMATIONS = [
  '4-4-2',
  '4-3-3',
  '4-2-3-1',
  '3-5-2',
  '5-3-2',
  '4-1-4-1',
  '3-4-3',
  '4-5-1',
  '5-4-1',
  '3-4-2-1'
];

const MatchPlanner = () => {
  const { matches, addMatch, updateMatch, deleteMatch, getUpcomingMatches, savedBoards } = useTactics();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [formData, setFormData] = useState({
    matchNumber: '',
    opponent: '',
    venue: 'home', // home or away
    competition: '',
    opponentTactic: '4-4-2',
    opponentPhilosophy: 'Possession-based',
    myTactic: '',
    notes: '',
    importance: 'medium' // low, medium, high
  });

  const allMatches = matches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const resetForm = () => {
    setFormData({
      matchNumber: '',
      opponent: '',
      venue: 'home',
      competition: '',
      opponentTactic: '4-4-2',
      opponentPhilosophy: 'Possession-based',
      myTactic: '',
      notes: '',
      importance: 'medium'
    });
    setEditingMatch(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingMatch) {
      updateMatch(editingMatch.id, formData);
    } else {
      addMatch(formData);
    }
    
    resetForm();
  };

  const handleEdit = (match) => {
    setFormData(match);
    setEditingMatch(match);
    setShowAddForm(true);
  };

  const handleDelete = (matchId) => {
    if (window.confirm('Are you sure you want to delete this match?')) {
      deleteMatch(matchId);
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Match Planner
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Plan your upcoming matches and analyze opponents
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="mt-4 sm:mt-0 btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Match
        </button>
      </div>

      {/* Add/Edit Match Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {editingMatch ? 'Edit Match' : 'Add New Match'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Match Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Match Number
                </label>
                <input
                  type="number"
                  value={formData.matchNumber}
                  onChange={(e) => setFormData({...formData, matchNumber: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., 15"
                />
              </div>

              

              {/* Opponent */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opponent *
                </label>
                <input
                  type="text"
                  value={formData.opponent}
                  onChange={(e) => setFormData({...formData, opponent: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Manchester United"
                  required
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Venue
                </label>
                <select
                  value={formData.venue}
                  onChange={(e) => setFormData({...formData, venue: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                </select>
              </div>

              {/* Competition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Competition
                </label>
                <input
                  type="text"
                  value={formData.competition}
                  onChange={(e) => setFormData({...formData, competition: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Premier League, Champions League"
                />
              </div>

              {/* Importance */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Importance
                </label>
                <select
                  value={formData.importance}
                  onChange={(e) => setFormData({...formData, importance: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Opponent Tactic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opponent Formation
                </label>
                <select
                  value={formData.opponentTactic}
                  onChange={(e) => setFormData({...formData, opponentTactic: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {OPPONENT_FORMATIONS.map(formation => (
                    <option key={formation} value={formation}>{formation}</option>
                  ))}
                </select>
              </div>

              {/* Opponent Philosophy */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Opponent Philosophy
                </label>
                <select
                  value={formData.opponentPhilosophy}
                  onChange={(e) => setFormData({...formData, opponentPhilosophy: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {TACTICAL_PHILOSOPHIES.map(philosophy => (
                    <option key={philosophy} value={philosophy}>{philosophy}</option>
                  ))}
                </select>
              </div>

              {/* My Tactic */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  My Tactic
                </label>
                <select
                  value={formData.myTactic}
                  onChange={(e) => setFormData({...formData, myTactic: e.target.value})}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select saved tactic...</option>
                  {savedBoards.map(board => (
                    <option key={board.id} value={board.id}>{board.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes & Analysis
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Key players, weaknesses, tactical notes..."
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {editingMatch ? 'Update Match' : 'Add Match'}
              </button>
            </div>
          </form>
        </div>
      )}

             {/* All Matches */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
         <div className="p-6 border-b border-gray-200 dark:border-gray-700">
           <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
             <Calendar className="w-5 h-5 mr-2" />
             Planned Matches ({allMatches.length})
           </h2>
         </div>
         <div className="p-6">
           {allMatches.length > 0 ? (
             <div className="space-y-4">
               {allMatches.map((match) => (
                 <MatchCard 
                   key={match.id} 
                   match={match} 
                   onEdit={handleEdit}
                   onDelete={handleDelete}
                   getImportanceColor={getImportanceColor}
                   formatDate={formatDate}
                   savedBoards={savedBoards}
                 />
               ))}
             </div>
           ) : (
             <div className="text-center py-8">
               <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
               <p className="text-gray-600 dark:text-gray-400">
                 No matches planned yet
               </p>
               <button 
                 onClick={() => setShowAddForm(true)}
                 className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
               >
                 Add your first match
               </button>
             </div>
           )}
         </div>
       </div>
    </div>
  );
};

// Match Card Component
const MatchCard = ({ match, onEdit, onDelete, getImportanceColor, formatDate, savedBoards, isPast = false }) => {
  const myTacticName = match.myTactic ? savedBoards.find(b => b.id === match.myTactic)?.name : 'Not assigned';
  
  return (
    <div className={`p-4 rounded-lg border ${isPast ? 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            {match.matchNumber && (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                #{match.matchNumber}
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              vs {match.opponent}
            </h3>
            <div className="flex items-center space-x-2">
              {match.venue === 'home' ? (
                <Home className="w-4 h-4 text-green-600" title="Home" />
              ) : (
                <Plane className="w-4 h-4 text-blue-600" title="Away" />
              )}
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(match.importance)}`}>
                {match.importance}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            
            
            {match.competition && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Competition:</span>
                <p className="font-medium text-gray-900 dark:text-white">{match.competition}</p>
              </div>
            )}
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Opponent Formation:</span>
              <p className="font-medium text-gray-900 dark:text-white">{match.opponentTactic}</p>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Their Style:</span>
              <p className="font-medium text-gray-900 dark:text-white">{match.opponentPhilosophy}</p>
            </div>
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">My Tactic:</span>
              <p className="font-medium text-gray-900 dark:text-white">{myTacticName}</p>
            </div>
          </div>
          
          {match.notes && (
            <div className="mt-3">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Notes:</span>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">{match.notes}</p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(match)}
            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
            title="Edit match"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(match.id)}
            className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
            title="Delete match"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchPlanner; 