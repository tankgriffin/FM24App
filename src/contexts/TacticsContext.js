import React, { createContext, useContext, useState, useEffect } from 'react';

const TacticsContext = createContext();

export const useTactics = () => {
  const context = useContext(TacticsContext);
  if (!context) {
    throw new Error('useTactics must be used within a TacticsProvider');
  }
  return context;
};

// Preset formations
// Coordinates: x = left (0) to right (100), y = attack (0) to defence/GK (100)
export const FORMATIONS = {

  // ── 4-back ───────────────────────────────────────────────────────────────

  '4-4-2': {
    name: '4-4-2',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lb',  role: 'FB', x: 20, y: 75 },
      { id: 'lcb', role: 'CD', x: 35, y: 75 },
      { id: 'rcb', role: 'CD', x: 65, y: 75 },
      { id: 'rb',  role: 'FB', x: 80, y: 75 },
      { id: 'lm',  role: 'WM', x: 20, y: 50 },
      { id: 'lcm', role: 'CM', x: 35, y: 50 },
      { id: 'rcm', role: 'CM', x: 65, y: 50 },
      { id: 'rm',  role: 'WM', x: 80, y: 50 },
      { id: 'lst', role: 'CF', x: 35, y: 25 },
      { id: 'rst', role: 'CF', x: 65, y: 25 },
    ],
  },

  '4-4-1-1': {
    name: '4-4-1-1',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lb',  role: 'FB', x: 20, y: 75 },
      { id: 'lcb', role: 'CD', x: 35, y: 75 },
      { id: 'rcb', role: 'CD', x: 65, y: 75 },
      { id: 'rb',  role: 'FB', x: 80, y: 75 },
      { id: 'lm',  role: 'WM', x: 20, y: 52 },
      { id: 'lcm', role: 'CM', x: 37, y: 52 },
      { id: 'rcm', role: 'CM', x: 63, y: 52 },
      { id: 'rm',  role: 'WM', x: 80, y: 52 },
      { id: 'cam', role: 'AM', x: 50, y: 37 },
      { id: 'st',  role: 'CF', x: 50, y: 22 },
    ],
  },

  '4-5-1': {
    name: '4-5-1',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lb',  role: 'FB', x: 20, y: 75 },
      { id: 'lcb', role: 'CD', x: 35, y: 75 },
      { id: 'rcb', role: 'CD', x: 65, y: 75 },
      { id: 'rb',  role: 'FB', x: 80, y: 75 },
      { id: 'lm',  role: 'WM', x: 14, y: 50 },
      { id: 'lcm', role: 'CM', x: 34, y: 52 },
      { id: 'cm',  role: 'CM', x: 50, y: 55 },
      { id: 'rcm', role: 'CM', x: 66, y: 52 },
      { id: 'rm',  role: 'WM', x: 86, y: 50 },
      { id: 'st',  role: 'CF', x: 50, y: 22 },
    ],
  },

  '4-3-3': {
    name: '4-3-3',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lb',  role: 'FB', x: 20, y: 75 },
      { id: 'lcb', role: 'CD', x: 35, y: 75 },
      { id: 'rcb', role: 'CD', x: 65, y: 75 },
      { id: 'rb',  role: 'FB', x: 80, y: 75 },
      { id: 'dm',  role: 'DLP', x: 50, y: 60 },
      { id: 'lcm', role: 'CM', x: 35, y: 45 },
      { id: 'rcm', role: 'CM', x: 65, y: 45 },
      { id: 'lw',  role: 'W',  x: 20, y: 25 },
      { id: 'st',  role: 'CF', x: 50, y: 25 },
      { id: 'rw',  role: 'W',  x: 80, y: 25 },
    ],
  },

  '4-3-2-1': {
    name: '4-3-2-1',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lb',  role: 'FB', x: 20, y: 75 },
      { id: 'lcb', role: 'CD', x: 35, y: 75 },
      { id: 'rcb', role: 'CD', x: 65, y: 75 },
      { id: 'rb',  role: 'FB', x: 80, y: 75 },
      { id: 'lcm', role: 'CM', x: 30, y: 58 },
      { id: 'cm',  role: 'CM', x: 50, y: 60 },
      { id: 'rcm', role: 'CM', x: 70, y: 58 },
      { id: 'lam', role: 'AM', x: 35, y: 40 },
      { id: 'ram', role: 'AM', x: 65, y: 40 },
      { id: 'st',  role: 'CF', x: 50, y: 22 },
    ],
  },

  '4-3-1-2': {
    name: '4-3-1-2',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lb',  role: 'FB', x: 20, y: 75 },
      { id: 'lcb', role: 'CD', x: 35, y: 75 },
      { id: 'rcb', role: 'CD', x: 65, y: 75 },
      { id: 'rb',  role: 'FB', x: 80, y: 75 },
      { id: 'lcm', role: 'CM', x: 30, y: 58 },
      { id: 'cm',  role: 'CM', x: 50, y: 60 },
      { id: 'rcm', role: 'CM', x: 70, y: 58 },
      { id: 'cam', role: 'AM', x: 50, y: 42 },
      { id: 'lst', role: 'CF', x: 37, y: 22 },
      { id: 'rst', role: 'CF', x: 63, y: 22 },
    ],
  },

  '4-2-3-1': {
    name: '4-2-3-1',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lb',  role: 'FB', x: 20, y: 75 },
      { id: 'lcb', role: 'CD', x: 35, y: 75 },
      { id: 'rcb', role: 'CD', x: 65, y: 75 },
      { id: 'rb',  role: 'FB', x: 80, y: 75 },
      { id: 'ldm', role: 'DLP', x: 35, y: 60 },
      { id: 'rdm', role: 'DLP', x: 65, y: 60 },
      { id: 'lam', role: 'AM', x: 25, y: 40 },
      { id: 'cam', role: 'AM', x: 50, y: 40 },
      { id: 'ram', role: 'AM', x: 75, y: 40 },
      { id: 'st',  role: 'CF', x: 50, y: 22 },
    ],
  },

  '4-1-4-1': {
    name: '4-1-4-1',
    positions: [
      { id: 'gk',  role: 'GK',  x: 50, y: 90 },
      { id: 'lb',  role: 'FB',  x: 20, y: 75 },
      { id: 'lcb', role: 'CD',  x: 35, y: 75 },
      { id: 'rcb', role: 'CD',  x: 65, y: 75 },
      { id: 'rb',  role: 'FB',  x: 80, y: 75 },
      { id: 'dm',  role: 'DLP', x: 50, y: 62 },
      { id: 'lm',  role: 'WM',  x: 20, y: 48 },
      { id: 'lcm', role: 'CM',  x: 36, y: 48 },
      { id: 'rcm', role: 'CM',  x: 64, y: 48 },
      { id: 'rm',  role: 'WM',  x: 80, y: 48 },
      { id: 'st',  role: 'CF',  x: 50, y: 22 },
    ],
  },

  '4-1-2-1-2': {
    name: '4-1-2-1-2',
    positions: [
      { id: 'gk',  role: 'GK',  x: 50, y: 90 },
      { id: 'lb',  role: 'FB',  x: 20, y: 75 },
      { id: 'lcb', role: 'CD',  x: 35, y: 75 },
      { id: 'rcb', role: 'CD',  x: 65, y: 75 },
      { id: 'rb',  role: 'FB',  x: 80, y: 75 },
      { id: 'dm',  role: 'DLP', x: 50, y: 62 },
      { id: 'lcm', role: 'CM',  x: 28, y: 50 },
      { id: 'rcm', role: 'CM',  x: 72, y: 50 },
      { id: 'cam', role: 'AM',  x: 50, y: 37 },
      { id: 'lst', role: 'CF',  x: 37, y: 22 },
      { id: 'rst', role: 'CF',  x: 63, y: 22 },
    ],
  },

  // ── 3-back ───────────────────────────────────────────────────────────────

  '3-5-2': {
    name: '3-5-2',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lcb', role: 'CD', x: 25, y: 76 },
      { id: 'cb',  role: 'CD', x: 50, y: 76 },
      { id: 'rcb', role: 'CD', x: 75, y: 76 },
      { id: 'lwb', role: 'WB', x: 14, y: 55 },
      { id: 'lcm', role: 'CM', x: 35, y: 52 },
      { id: 'cm',  role: 'CM', x: 50, y: 52 },
      { id: 'rcm', role: 'CM', x: 65, y: 52 },
      { id: 'rwb', role: 'WB', x: 86, y: 55 },
      { id: 'lst', role: 'CF', x: 35, y: 25 },
      { id: 'rst', role: 'CF', x: 65, y: 25 },
    ],
  },

  '3-4-3': {
    name: '3-4-3',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lcb', role: 'CD', x: 25, y: 76 },
      { id: 'cb',  role: 'CD', x: 50, y: 76 },
      { id: 'rcb', role: 'CD', x: 75, y: 76 },
      { id: 'lwb', role: 'WB', x: 12, y: 57 },
      { id: 'lcm', role: 'CM', x: 38, y: 55 },
      { id: 'rcm', role: 'CM', x: 62, y: 55 },
      { id: 'rwb', role: 'WB', x: 88, y: 57 },
      { id: 'lw',  role: 'W',  x: 22, y: 25 },
      { id: 'st',  role: 'CF', x: 50, y: 20 },
      { id: 'rw',  role: 'W',  x: 78, y: 25 },
    ],
  },

  '3-4-2-1': {
    name: '3-4-2-1',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lcb', role: 'CD', x: 25, y: 76 },
      { id: 'cb',  role: 'CD', x: 50, y: 76 },
      { id: 'rcb', role: 'CD', x: 75, y: 76 },
      { id: 'lwb', role: 'WB', x: 12, y: 57 },
      { id: 'lcm', role: 'CM', x: 37, y: 54 },
      { id: 'rcm', role: 'CM', x: 63, y: 54 },
      { id: 'rwb', role: 'WB', x: 88, y: 57 },
      { id: 'lam', role: 'AM', x: 35, y: 36 },
      { id: 'ram', role: 'AM', x: 65, y: 36 },
      { id: 'st',  role: 'CF', x: 50, y: 20 },
    ],
  },

  '3-4-1-2': {
    name: '3-4-1-2',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lcb', role: 'CD', x: 25, y: 76 },
      { id: 'cb',  role: 'CD', x: 50, y: 76 },
      { id: 'rcb', role: 'CD', x: 75, y: 76 },
      { id: 'lwb', role: 'WB', x: 12, y: 57 },
      { id: 'lcm', role: 'CM', x: 38, y: 55 },
      { id: 'rcm', role: 'CM', x: 62, y: 55 },
      { id: 'rwb', role: 'WB', x: 88, y: 57 },
      { id: 'cam', role: 'AM', x: 50, y: 40 },
      { id: 'lst', role: 'CF', x: 37, y: 22 },
      { id: 'rst', role: 'CF', x: 63, y: 22 },
    ],
  },

  '3-1-4-2': {
    name: '3-1-4-2',
    positions: [
      { id: 'gk',  role: 'GK',  x: 50, y: 90 },
      { id: 'lcb', role: 'CD',  x: 25, y: 76 },
      { id: 'cb',  role: 'CD',  x: 50, y: 76 },
      { id: 'rcb', role: 'CD',  x: 75, y: 76 },
      { id: 'dm',  role: 'DLP', x: 50, y: 63 },
      { id: 'lm',  role: 'WM',  x: 18, y: 50 },
      { id: 'lcm', role: 'CM',  x: 38, y: 52 },
      { id: 'rcm', role: 'CM',  x: 62, y: 52 },
      { id: 'rm',  role: 'WM',  x: 82, y: 50 },
      { id: 'lst', role: 'CF',  x: 37, y: 22 },
      { id: 'rst', role: 'CF',  x: 63, y: 22 },
    ],
  },

  // ── 5-back (3 CBs + 2 WBs) ───────────────────────────────────────────────

  '5-4-1': {
    name: '5-4-1',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lwb', role: 'WB', x: 12, y: 72 },
      { id: 'lcb', role: 'CD', x: 30, y: 77 },
      { id: 'cb',  role: 'CD', x: 50, y: 78 },
      { id: 'rcb', role: 'CD', x: 70, y: 77 },
      { id: 'rwb', role: 'WB', x: 88, y: 72 },
      { id: 'lm',  role: 'WM', x: 20, y: 50 },
      { id: 'lcm', role: 'CM', x: 38, y: 52 },
      { id: 'rcm', role: 'CM', x: 62, y: 52 },
      { id: 'rm',  role: 'WM', x: 80, y: 50 },
      { id: 'st',  role: 'CF', x: 50, y: 22 },
    ],
  },

  '5-3-2': {
    name: '5-3-2',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lwb', role: 'WB', x: 12, y: 72 },
      { id: 'lcb', role: 'CD', x: 30, y: 77 },
      { id: 'cb',  role: 'CD', x: 50, y: 78 },
      { id: 'rcb', role: 'CD', x: 70, y: 77 },
      { id: 'rwb', role: 'WB', x: 88, y: 72 },
      { id: 'lcm', role: 'CM', x: 30, y: 52 },
      { id: 'cm',  role: 'CM', x: 50, y: 50 },
      { id: 'rcm', role: 'CM', x: 70, y: 52 },
      { id: 'lst', role: 'CF', x: 37, y: 22 },
      { id: 'rst', role: 'CF', x: 63, y: 22 },
    ],
  },

  '5-2-3': {
    name: '5-2-3',
    positions: [
      { id: 'gk',  role: 'GK', x: 50, y: 90 },
      { id: 'lwb', role: 'WB', x: 12, y: 72 },
      { id: 'lcb', role: 'CD', x: 30, y: 77 },
      { id: 'cb',  role: 'CD', x: 50, y: 78 },
      { id: 'rcb', role: 'CD', x: 70, y: 77 },
      { id: 'rwb', role: 'WB', x: 88, y: 72 },
      { id: 'lcm', role: 'CM', x: 38, y: 55 },
      { id: 'rcm', role: 'CM', x: 62, y: 55 },
      { id: 'lw',  role: 'W',  x: 22, y: 25 },
      { id: 'st',  role: 'CF', x: 50, y: 22 },
      { id: 'rw',  role: 'W',  x: 78, y: 25 },
    ],
  },
};

export const TacticsProvider = ({ children }) => {
  const [currentBoard, setCurrentBoard] = useState(null);
  const [savedBoards, setSavedBoards] = useState([]);
  const [matches, setMatches] = useState([]);
  const [preferredRoles, setPreferredRoles] = useState([]);
  const [tacticSetup, setTacticSetupState] = useState(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedBoardsData = localStorage.getItem('fm24-saved-boards');
    if (savedBoardsData) {
      try {
        setSavedBoards(JSON.parse(savedBoardsData));
      } catch (error) {
        console.error('Error loading saved boards:', error);
      }
    }

    const matchesData = localStorage.getItem('fm24-matches');
    if (matchesData) {
      try {
        setMatches(JSON.parse(matchesData));
      } catch (error) {
        console.error('Error loading matches:', error);
      }
    }

    const preferredRolesData = localStorage.getItem('fm24-preferred-roles');
    if (preferredRolesData) {
      try {
        setPreferredRoles(JSON.parse(preferredRolesData));
      } catch (error) {
        console.error('Error loading preferred roles:', error);
      }
    }

    const tacticSetupData = localStorage.getItem('fm24-tactic-setup');
    if (tacticSetupData) {
      try {
        setTacticSetupState(JSON.parse(tacticSetupData));
      } catch (error) {
        console.error('Error loading tactic setup:', error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (savedBoards.length > 0) {
      localStorage.setItem('fm24-saved-boards', JSON.stringify(savedBoards));
    }
  }, [savedBoards]);

  useEffect(() => {
    if (matches.length > 0) {
      localStorage.setItem('fm24-matches', JSON.stringify(matches));
    }
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('fm24-preferred-roles', JSON.stringify(preferredRoles));
  }, [preferredRoles]);

  useEffect(() => {
    if (tacticSetup) {
      localStorage.setItem('fm24-tactic-setup', JSON.stringify(tacticSetup));
    }
  }, [tacticSetup]);

  const setTacticSetup = (setup) => {
    setTacticSetupState(setup);
  };

  // Preferred roles functions
  const addPreferredRole = (role) => {
    if (!preferredRoles.includes(role)) {
      setPreferredRoles([...preferredRoles, role]);
    }
  };

  const removePreferredRole = (role) => {
    setPreferredRoles(preferredRoles.filter(r => r !== role));
  };

  const clearPreferredRoles = () => {
    setPreferredRoles([]);
  };

  const createBoard = (formation = '4-4-2') => {
    const formationData = FORMATIONS[formation];
    if (!formationData) return;

    const newBoard = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${formation} Tactic`,
      formation: formation,
      myTeam: {
        formation: formation,
        players: formationData.positions.map(pos => ({
          ...pos,
          playerId: null,
          playerName: '',
        }))
      },
      opponent: {
        formation: formation,
        players: formationData.positions.map(pos => ({
          ...pos,
          playerId: null,
          playerName: '',
        }))
      },
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentBoard(newBoard);
    return newBoard;
  };

  const saveBoard = (board, name) => {
    const boardToSave = {
      ...board,
      name: name || board.name,
      updatedAt: new Date().toISOString(),
    };

    const existingIndex = savedBoards.findIndex(b => b.id === board.id);
    if (existingIndex >= 0) {
      const updatedBoards = [...savedBoards];
      updatedBoards[existingIndex] = boardToSave;
      setSavedBoards(updatedBoards);
    } else {
      setSavedBoards([...savedBoards, boardToSave]);
    }

    setCurrentBoard(boardToSave);
    return boardToSave;
  };

  const loadBoard = (boardId) => {
    const board = savedBoards.find(b => b.id === boardId);
    if (board) {
      setCurrentBoard(board);
    }
    return board;
  };

  const deleteBoard = (boardId) => {
    setSavedBoards(savedBoards.filter(b => b.id !== boardId));
    if (currentBoard && currentBoard.id === boardId) {
      setCurrentBoard(null);
    }
  };

  const updateBoardPlayer = (team, positionId, playerId, playerName) => {
    if (!currentBoard) return;

    const updatedBoard = { ...currentBoard };
    const teamData = updatedBoard[team];
    const playerIndex = teamData.players.findIndex(p => p.id === positionId);
    
    if (playerIndex >= 0) {
      teamData.players[playerIndex] = {
        ...teamData.players[playerIndex],
        playerId,
        playerName,
      };
    }

    updatedBoard.updatedAt = new Date().toISOString();
    setCurrentBoard(updatedBoard);
  };

  const updateBoardPosition = (team, positionId, x, y) => {
    if (!currentBoard) return;

    const updatedBoard = { ...currentBoard };
    const teamData = updatedBoard[team];
    const playerIndex = teamData.players.findIndex(p => p.id === positionId);
    
    if (playerIndex >= 0) {
      teamData.players[playerIndex] = {
        ...teamData.players[playerIndex],
        x,
        y,
      };
    }

    updatedBoard.updatedAt = new Date().toISOString();
    setCurrentBoard(updatedBoard);
  };

  const changeFormation = (team, formation) => {
    if (!currentBoard || !FORMATIONS[formation]) return;

    const updatedBoard = { ...currentBoard };
    const formationData = FORMATIONS[formation];
    
    updatedBoard[team] = {
      formation: formation,
      players: formationData.positions.map(pos => ({
        ...pos,
        playerId: null,
        playerName: '',
      }))
    };

    updatedBoard.updatedAt = new Date().toISOString();
    setCurrentBoard(updatedBoard);
  };

  // Match planning functions
  const addMatch = (matchData) => {
    const newMatch = {
      id: Math.random().toString(36).substr(2, 9),
      ...matchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMatches([...matches, newMatch]);
    return newMatch;
  };

  const updateMatch = (matchId, matchData) => {
    const updatedMatches = matches.map(match => 
      match.id === matchId 
        ? { ...match, ...matchData, updatedAt: new Date().toISOString() }
        : match
    );
    setMatches(updatedMatches);
  };

  const deleteMatch = (matchId) => {
    setMatches(matches.filter(m => m.id !== matchId));
  };

  const getUpcomingMatches = (limit = 5) => {
    // Since we removed dates, just return all matches sorted by creation date
    return matches
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  };

  const value = {
    currentBoard,
    savedBoards,
    matches,
    createBoard,
    saveBoard,
    loadBoard,
    deleteBoard,
    updateBoardPlayer,
    updateBoardPosition,
    changeFormation,
    addMatch,
    updateMatch,
    deleteMatch,
    getUpcomingMatches,
    setCurrentBoard,
    preferredRoles,
    addPreferredRole,
    removePreferredRole,
    clearPreferredRoles,
    tacticSetup,
    setTacticSetup,
  };

  return (
    <TacticsContext.Provider value={value}>
      {children}
    </TacticsContext.Provider>
  );
}; 