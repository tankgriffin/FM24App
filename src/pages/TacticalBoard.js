import React, { useState, useRef, useEffect } from 'react';
import { useTactics } from '../contexts/TacticsContext';
import { useSquad } from '../contexts/SquadContext';
import { Save, Download, Upload, RotateCcw, Plus } from 'lucide-react';
import SquadAnalysisTable from '../components/SquadAnalysisTable';

// Common formations with positions (x, y coordinates as percentages)
const FORMATIONS = {
  '4-4-2': {
    name: '4-4-2',
    positions: [
      { x: 10, y: 50, role: 'GK' }, // Goalkeeper
      { x: 25, y: 20, role: 'FB' }, // Right Back
      { x: 25, y: 35, role: 'CB' }, // Center Back
      { x: 25, y: 65, role: 'CB' }, // Center Back
      { x: 25, y: 80, role: 'FB' }, // Left Back
      { x: 50, y: 25, role: 'WM' }, // Right Mid
      { x: 50, y: 40, role: 'CM' }, // Center Mid
      { x: 50, y: 60, role: 'CM' }, // Center Mid
      { x: 50, y: 75, role: 'WM' }, // Left Mid
      { x: 75, y: 40, role: 'ST' }, // Striker
      { x: 75, y: 60, role: 'ST' }, // Striker
    ]
  },
  '4-3-3': {
    name: '4-3-3',
    positions: [
      { x: 10, y: 50, role: 'GK' },
      { x: 25, y: 20, role: 'FB' },
      { x: 25, y: 35, role: 'CB' },
      { x: 25, y: 65, role: 'CB' },
      { x: 25, y: 80, role: 'FB' },
      { x: 45, y: 50, role: 'DM' }, // Defensive midfielder
      { x: 60, y: 35, role: 'CM' }, // Central midfielder
      { x: 60, y: 65, role: 'CM' }, // Central midfielder
      { x: 75, y: 25, role: 'W' },
      { x: 75, y: 50, role: 'ST' },
      { x: 75, y: 75, role: 'W' },
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    positions: [
      { x: 10, y: 50, role: 'GK' },
      { x: 25, y: 30, role: 'CB' },
      { x: 25, y: 50, role: 'CB' },
      { x: 25, y: 70, role: 'CB' },
      { x: 45, y: 15, role: 'WB' }, // Wing back
      { x: 45, y: 35, role: 'DM' }, // Defensive midfielder
      { x: 45, y: 65, role: 'DM' }, // Defensive midfielder
      { x: 45, y: 85, role: 'WB' }, // Wing back
      { x: 65, y: 50, role: 'AM' }, // Attacking midfielder
      { x: 75, y: 40, role: 'ST' },
      { x: 75, y: 60, role: 'ST' },
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { x: 10, y: 50, role: 'GK' },
      { x: 25, y: 20, role: 'FB' },
      { x: 25, y: 35, role: 'CB' },
      { x: 25, y: 65, role: 'CB' },
      { x: 25, y: 80, role: 'FB' },
      { x: 45, y: 35, role: 'DM' },
      { x: 45, y: 65, role: 'DM' },
      { x: 65, y: 25, role: 'AM' },
      { x: 65, y: 50, role: 'AM' },
      { x: 65, y: 75, role: 'AM' },
      { x: 80, y: 50, role: 'ST' },
    ]
  },
  '5-3-2': {
    name: '5-3-2',
    positions: [
      { x: 10, y: 50, role: 'GK' },
      { x: 25, y: 15, role: 'WB' },
      { x: 25, y: 30, role: 'CB' },
      { x: 25, y: 50, role: 'CB' },
      { x: 25, y: 70, role: 'CB' },
      { x: 25, y: 85, role: 'WB' },
      { x: 55, y: 35, role: 'CM' },
      { x: 55, y: 50, role: 'CM' },
      { x: 55, y: 65, role: 'CM' },
      { x: 75, y: 40, role: 'ST' },
      { x: 75, y: 60, role: 'ST' },
    ]
  }
};

const TacticalBoard = () => {
  const { players } = useSquad();
  const { matches, preferredRoles } = useTactics();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [myFormation, setMyFormation] = useState('4-4-2');
  const [opponentFormation, setOpponentFormation] = useState('4-4-2');
  const [myPlayers, setMyPlayers] = useState([]);
  const [opponentPlayers, setOpponentPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [arrows, setArrows] = useState([]);
  const [isDrawingArrow, setIsDrawingArrow] = useState(false);
  const [arrowStart, setArrowStart] = useState(null);
  const [roleSelections, setRoleSelections] = useState([]);
  const boardRef = useRef(null);

  // Overlap detection and resolution
  const resolveOverlaps = (myPlayersTemp, opponentPlayersTemp) => {
    const OVERLAP_THRESHOLD = 8; // Distance threshold for overlap detection
    const SEPARATION_ADJUSTMENT = 3; // How much to move players apart

    // Check each blue player against each red player
    myPlayersTemp.forEach((bluePlayer, blueIndex) => {
      opponentPlayersTemp.forEach((redPlayer, redIndex) => {
        const distance = Math.sqrt(
          Math.pow(bluePlayer.x - redPlayer.x, 2) + 
          Math.pow(bluePlayer.y - redPlayer.y, 2)
        );

        // If overlap detected, adjust positions
        if (distance < OVERLAP_THRESHOLD) {
          // Move blue player 3% to the left
          myPlayersTemp[blueIndex] = {
            ...bluePlayer,
            x: Math.max(0, bluePlayer.x - SEPARATION_ADJUSTMENT)
          };
          
          // Move red player 3% to the right
          opponentPlayersTemp[redIndex] = {
            ...redPlayer,
            x: Math.min(100, redPlayer.x + SEPARATION_ADJUSTMENT)
          };
        }
      });
    });

    return { myPlayersTemp, opponentPlayersTemp };
  };

  // Initialize players when formation changes
  useEffect(() => {
    const myFormationData = FORMATIONS[myFormation];
    const opponentFormationData = FORMATIONS[opponentFormation];
    
    let myPlayersTemp = myFormationData.positions.map((pos, index) => ({
      id: `my-${index}`,
      x: pos.x - 5, // Move blue team 5% to the left
      y: pos.y + (pos.y > 50 && ['W', 'WM', 'WB', 'FB'].includes(pos.role) ? 5 : 0) + (pos.y < 50 && ['W', 'WM', 'WB', 'FB'].includes(pos.role) ? -5 : 0), // LW/LM/LWB/LB down 5%, RW/RM/RWB/RB up 5%
      role: pos.role,
      playerId: null,
      playerName: `Player ${index + 1}`
    }));

    let opponentPlayersTemp = opponentFormationData.positions.map((pos, index) => ({
      id: `opp-${index}`,
      x: (100 - pos.x) + 5, // Mirror for opponent side and move 5% to the right
      y: pos.y + (pos.y > 50 && ['W', 'WM', 'WB', 'FB'].includes(pos.role) ? 5 : 0) + (pos.y < 50 && ['W', 'WM', 'WB', 'FB'].includes(pos.role) ? -5 : 0), // LW/LM/LWB/LB down 5%, RW/RM/RWB/RB up 5%
      role: pos.role,
      playerName: `Opp ${index + 1}`
    }));

    // Resolve any overlaps
    const resolved = resolveOverlaps(myPlayersTemp, opponentPlayersTemp);
    
    setMyPlayers(resolved.myPlayersTemp);
    setOpponentPlayers(resolved.opponentPlayersTemp);
    // Initialize roleSelections to default roles for each position
    setRoleSelections(myFormationData.positions.map(pos => pos.role));
  }, [myFormation, opponentFormation]);

  const handlePlayerDrag = (playerId, newX, newY, isMyTeam) => {
    // Update player position - no restrictions, full freedom of movement
    if (isMyTeam) {
      setMyPlayers(prev => prev.map(player => 
        player.id === playerId ? { ...player, x: newX, y: newY } : player
      ));
    } else {
      setOpponentPlayers(prev => prev.map(player => 
        player.id === playerId ? { ...player, x: newX, y: newY } : player
      ));
    }

    // Update arrows that start from this player
    setArrows(prev => prev.map(arrow => 
      arrow.fromId === playerId 
        ? { ...arrow, fromX: newX, fromY: newY }
        : arrow
    ));
  };

  const handlePlayerSelect = (playerIndex, selectedPlayerId) => {
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);
    setMyPlayers(prev => prev.map((player, index) => 
      index === playerIndex ? { 
        ...player, 
        playerId: selectedPlayerId,
        playerName: selectedPlayer ? selectedPlayer.Name || `Player ${index + 1}` : `Player ${index + 1}`
      } : player
    ));
  };

  const startArrow = (playerId, x, y) => {
    setIsDrawingArrow(true);
    setArrowStart({ playerId, x, y });
  };

  const endArrow = (x, y) => {
    if (isDrawingArrow && arrowStart) {
      const newArrow = {
        id: Date.now(),
        fromId: arrowStart.playerId,
        fromX: arrowStart.x,
        fromY: arrowStart.y,
        toX: x,
        toY: y
      };
      setArrows(prev => [...prev, newArrow]);
    }
    setIsDrawingArrow(false);
    setArrowStart(null);
  };

  const clearArrows = () => {
    setArrows([]);
  };

  const handleMatchSelect = (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setOpponentFormation(match.opponentTactic);
    } else {
      setSelectedMatch(null);
    }
  };

  const saveTactic = () => {
    const tacticName = selectedMatch 
      ? `${myFormation} vs ${selectedMatch.opponent} (${selectedMatch.opponentTactic})`
      : `${myFormation} vs ${opponentFormation}`;
      
    const tactic = {
      id: Date.now(),
      name: tacticName,
      myFormation,
      opponentFormation,
      myPlayers,
      opponentPlayers,
      arrows,
      matchId: selectedMatch?.id || null,
      createdAt: new Date().toISOString()
    };
    
    const savedTactics = JSON.parse(localStorage.getItem('fm24-tactics') || '[]');
    savedTactics.push(tactic);
    localStorage.setItem('fm24-tactics', JSON.stringify(savedTactics));
    
    alert('Tactic saved successfully!');
  };

  // Handler for changing role selection for a position
  const handleRoleChange = (index, newRole) => {
    setRoleSelections(prev => prev.map((role, i) => i === index ? newRole : role));
    setMyPlayers(prev => prev.map((player, i) => i === index ? { ...player, role: newRole } : player));
  };

  // Handler for player search in dropdown
  const [playerSearch, setPlayerSearch] = useState({});
  const handlePlayerSearch = (index, value) => {
    setPlayerSearch(prev => ({ ...prev, [index]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tactical Board
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Design formations and plan player movements
          </p>
        </div>
        <div className="mt-4 lg:mt-0 flex flex-wrap gap-3">
          <button onClick={clearArrows} className="btn-secondary">
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear Arrows
          </button>
          <button onClick={saveTactic} className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Tactic
          </button>
        </div>
      </div>

      {/* Match Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Select Match (Optional)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <select 
              value={selectedMatch?.id || ''} 
              onChange={(e) => handleMatchSelect(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">No specific match - Custom setup</option>
              {matches.map(match => (
                <option key={match.id} value={match.id}>
                  vs {match.opponent} ({match.opponentTactic}) - {match.competition || 'Match'}
                </option>
              ))}
            </select>
          </div>
          {selectedMatch && (
            <div className="text-sm text-gray-600 dark:text-gray-400 p-2">
              <p><strong>Opponent:</strong> {selectedMatch.opponent}</p>
              <p><strong>Style:</strong> {selectedMatch.opponentPhilosophy}</p>
              <p><strong>Venue:</strong> {selectedMatch.venue === 'home' ? 'Home' : 'Away'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Formation Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">My Team Formation</h3>
          <select 
            value={myFormation} 
            onChange={(e) => setMyFormation(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {Object.keys(FORMATIONS).map(formation => (
              <option key={formation} value={formation}>{formation}</option>
            ))}
          </select>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">
            Opponent Formation {selectedMatch && `(${selectedMatch.opponent})`}
          </h3>
          <select 
            value={opponentFormation} 
            onChange={(e) => setOpponentFormation(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={selectedMatch} // Disable if match is selected
          >
            {Object.keys(FORMATIONS).map(formation => (
              <option key={formation} value={formation}>{formation}</option>
            ))}
          </select>
          {selectedMatch && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Formation set from selected match
            </p>
          )}
        </div>
      </div>

      {/* Tactical Board */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div 
          ref={boardRef}
          className="relative w-full h-96 bg-green-600 rounded-lg overflow-hidden"
          style={{ aspectRatio: '16/10' }}
          onClick={(e) => {
            if (isDrawingArrow) {
              const rect = boardRef.current.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;
              endArrow(x, y);
            }
          }}
        >
          {/* Field markings */}
          <div className="absolute inset-0">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white opacity-60"></div>
            {/* Center circle */}
            <div className="absolute left-1/2 top-1/2 w-20 h-20 border-2 border-white opacity-60 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            {/* Goal areas */}
            <div className="absolute left-0 top-1/3 bottom-1/3 w-8 border-2 border-white opacity-60"></div>
            <div className="absolute right-0 top-1/3 bottom-1/3 w-8 border-2 border-white opacity-60"></div>
          </div>

          {/* Arrows */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {arrows.map(arrow => (
              <g key={arrow.id}>
                <defs>
                  <marker
                    id={`arrowhead-${arrow.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="yellow"
                    />
                  </marker>
                </defs>
                <line
                  x1={`${arrow.fromX}%`}
                  y1={`${arrow.fromY}%`}
                  x2={`${arrow.toX}%`}
                  y2={`${arrow.toY}%`}
                  stroke="yellow"
                  strokeWidth="3"
                  markerEnd={`url(#arrowhead-${arrow.id})`}
                />
              </g>
            ))}
          </svg>

          {/* My Team Players (Blue) */}
          {myPlayers.map((player, index) => (
            <PlayerCircle
              key={player.id}
              player={player}
              color="blue"
              onDrag={handlePlayerDrag}
              onArrowStart={startArrow}
              boardRef={boardRef}
              isMyTeam={true}
            />
          ))}

                     {/* Opponent Players (Red) */}
           {opponentPlayers.map((player, index) => (
             <PlayerCircle
               key={player.id}
               player={player}
               color="red"
               onDrag={handlePlayerDrag}
               onArrowStart={startArrow}
               boardRef={boardRef}
               isMyTeam={false}
             />
           ))}


         </div>
       </div>

       {/* Player Selection Dropdowns - Moved below tactical board */}
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4">
         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Assign Squad Players</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {myPlayers.map((player, index) => {
             // Get the selected role for this position
             const selectedRole = roleSelections[index] || player.role;
             // Filter and sort players by score for this role
             const scoredPlayers = players
               .map(squadPlayer => {
                 let score = 0;
                 if (selectedRole && squadPlayer.roleScores) {
                   score = selectedRole === 'GK'
                     ? (squadPlayer.roleScores.GK || 0)
                     : (squadPlayer.roleScores[selectedRole] || 0);
                 }
                 return { ...squadPlayer, _score: score };
               })
               .filter(squadPlayer => {
                 const search = playerSearch[index]?.toLowerCase() || '';
                 return !search || (squadPlayer.Name?.toLowerCase().includes(search));
               })
               .sort((a, b) => b._score - a._score);
             return (
               <div key={player.id} className="space-y-2">
                 <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                   Position {index + 1}
                 </label>
                 {/* Role selector for this position */}
                 <select
                   value={selectedRole}
                   onChange={e => handleRoleChange(index, e.target.value)}
                   className="w-full p-2 text-sm border border-blue-300 dark:border-blue-600 rounded bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100 mb-1"
                 >
                   {preferredRoles.map(role => (
                     <option key={role} value={role}>
                       {require('../utils/roleCalculations').ROLE_NAMES[role] || role}
                     </option>
                   ))}
                 </select>
                 {/* Player search input */}
                 <input
                   type="text"
                   placeholder="Search player..."
                   value={playerSearch[index] || ''}
                   onChange={e => handlePlayerSearch(index, e.target.value)}
                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-1"
                 />
                 {/* Player assignment dropdown, sorted by score for this role */}
                 <select
                   value={player.playerId || ''}
                   onChange={e => handlePlayerSelect(index, e.target.value)}
                   className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 >
                   <option value="">Select Player</option>
                   {scoredPlayers.map(squadPlayer => (
                     <option key={squadPlayer.id} value={squadPlayer.id}>
                       {squadPlayer.Name || 'Unknown Player'}
                       {selectedRole && squadPlayer._score ? ` (${squadPlayer._score})` : ''}
                     </option>
                   ))}
                 </select>
               </div>
             );
           })}
         </div>
       </div>

       <div className="mt-8">
         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Squad Analysis Table</h3>
         <SquadAnalysisTable players={players} preferredRoles={roleSelections} />
       </div>
     </div>
   );
 };

// Player Circle Component
const PlayerCircle = ({ player, color, onDrag, onArrowStart, boardRef, isMyTeam }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.shiftKey) {
      // Shift + click to start arrow
      onArrowStart(player.id, player.x, player.y);
      return;
    }
    setIsDragging(true);
    const rect = boardRef.current.getBoundingClientRect();
    const circleX = (player.x / 100) * rect.width;
    const circleY = (player.y / 100) * rect.height;
    setDragOffset({
      x: e.clientX - rect.left - circleX,
      y: e.clientY - rect.top - circleY
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = boardRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100));
    onDrag(player.id, newX, newY, isMyTeam);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const circleColor = color === 'blue' ? 'bg-blue-500 border-blue-700' : 'bg-red-500 border-red-700';
  const textColor = 'text-white';

  // Extract player number if available, else use index+1 fallback
  const playerNumber = player.squadNumber || player.number || (player.playerName && player.playerName.match(/\d+/)?.[0]) || '';

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 50 : 10
      }}
    >
      {/* Player Name above the circle */}
      <div className="mb-1 text-xs font-semibold text-gray-900 dark:text-white text-center whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis">
        {player.playerName}
      </div>
      {/* Player Number in the circle */}
      <div
        className={`w-10 h-10 ${circleColor} border-2 rounded-full cursor-move flex items-center justify-center text-lg font-bold ${textColor} select-none shadow-lg`}
        onMouseDown={handleMouseDown}
        title={`${player.playerName} (${player.role}) - Drag to move, Shift+Click for arrow`}
      >
        {playerNumber || (player.playerName ? player.playerName.charAt(0) : '?')}
      </div>
    </div>
  );
};

export default TacticalBoard; 