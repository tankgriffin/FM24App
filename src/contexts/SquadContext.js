import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculatePlayerRoleScores } from '../utils/roleCalculations';

const SquadContext = createContext();

export const useSquad = () => {
  const context = useContext(SquadContext);
  if (!context) {
    throw new Error('useSquad must be used within a SquadProvider');
  }
  return context;
};

export const SquadProvider = ({ children }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [currentSeason, setCurrentSeason] = useState(1);

  // Load squad data and seasons from localStorage on mount
  useEffect(() => {
    const savedSquad = localStorage.getItem('fm24-squad');
    const savedSeasons = localStorage.getItem('fm24-seasons');
    const savedCurrentSeason = localStorage.getItem('fm24-current-season');
    
    if (savedSquad) {
      try {
        const parsedSquad = JSON.parse(savedSquad);
        setPlayers(parsedSquad);
      } catch (error) {
        console.error('Error loading saved squad:', error);
      }
    }
    
    if (savedSeasons) {
      try {
        const parsedSeasons = JSON.parse(savedSeasons);
        setSeasons(parsedSeasons);
      } catch (error) {
        console.error('Error loading saved seasons:', error);
      }
    }
    
    if (savedCurrentSeason) {
      setCurrentSeason(parseInt(savedCurrentSeason));
    }
  }, []);

  // Save squad data to localStorage whenever players change
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('fm24-squad', JSON.stringify(players));
    }
  }, [players]);

  // Save seasons data to localStorage whenever seasons change
  useEffect(() => {
    localStorage.setItem('fm24-seasons', JSON.stringify(seasons));
  }, [seasons]);

  // Save current season to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('fm24-current-season', currentSeason.toString());
  }, [currentSeason]);

  const importSquadData = (htmlContent) => {
    setLoading(true);
    try {
      // Parse HTML table and extract player data
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const table = doc.querySelector('table');
      
      if (!table) {
        throw new Error('No table found in HTML content');
      }

      const rows = Array.from(table.querySelectorAll('tr'));
      const headerRow = rows[0];
      const dataRows = rows.slice(1);

      // Extract headers
      const headers = Array.from(headerRow.querySelectorAll('th, td')).map(cell => 
        cell.textContent.trim()
      );

      // Extract player data
      const playersData = dataRows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const playerData = {};
        
        headers.forEach((header, index) => {
          if (cells[index]) {
            playerData[header] = cells[index].textContent.trim();
          }
        });

        // Calculate role scores for this player
        const roleScores = calculatePlayerRoleScores(playerData);
        
        return {
          ...playerData,
          id: Math.random().toString(36).substr(2, 9),
          roleScores,
          // Extract Height, Foot strengths, and Personality from the data
          Height: playerData.Height || 'N/A',
          LeftFoot: playerData['Left Foot'] || 'N/A',
          RightFoot: playerData['Right Foot'] || 'N/A',
          Personality: playerData.Personality || 'N/A',
          Position: playerData.Position || 'N/A',
          Age: playerData.Age || 'N/A',
          Name: playerData.Name || 'Unknown Player',
        };
      });

      setPlayers(playersData);
      
      // --- Fix: Always create a season if none exist, and save squad to history ---
      setSeasons(prevSeasons => {
        let updatedSeasons = [...prevSeasons];
        let seasonNum = currentSeason;
        if (updatedSeasons.length === 0) {
          seasonNum = 1;
          setCurrentSeason(1);
        }
        const seasonIndex = updatedSeasons.findIndex(s => s.season === seasonNum);
        if (seasonIndex >= 0) {
          updatedSeasons[seasonIndex] = {
            ...updatedSeasons[seasonIndex],
            players: playersData,
            lastUpdated: new Date().toISOString()
          };
        } else {
          updatedSeasons.push({
            season: seasonNum,
            players: playersData,
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
        return updatedSeasons.sort((a, b) => a.season - b.season);
      });
      // --- End fix ---
    } catch (error) {
      console.error('Error importing squad data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentSquadToHistory = () => {
    if (players.length > 0) {
      setSeasons(prevSeasons => {
        const updatedSeasons = [...prevSeasons];
        const seasonIndex = updatedSeasons.findIndex(s => s.season === currentSeason);
        
        if (seasonIndex >= 0) {
          // Update existing season
          updatedSeasons[seasonIndex] = {
            ...updatedSeasons[seasonIndex],
            players: players,
            lastUpdated: new Date().toISOString()
          };
        } else {
          // Add new season
          updatedSeasons.push({
            season: currentSeason,
            players: players,
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          });
        }
        
        return updatedSeasons.sort((a, b) => a.season - b.season);
      });
    }
  };

  const createNewSeason = () => {
    const newSeasonNumber = Math.max(...seasons.map(s => s.season), 0) + 1;
    setCurrentSeason(newSeasonNumber);
    setPlayers([]); // Clear current players for new season
  };

  const switchToSeason = (seasonNumber) => {
    const seasonData = seasons.find(s => s.season === seasonNumber);
    if (seasonData) {
      setCurrentSeason(seasonNumber);
      setPlayers(seasonData.players);
    }
  };

  const getSeasonData = (seasonNumber) => {
    return seasons.find(s => s.season === seasonNumber);
  };

  const getAllSeasons = () => {
    return seasons.sort((a, b) => a.season - b.season);
  };

  const getPlayerHistory = (playerName) => {
    return seasons.map(season => {
      const player = season.players.find(p => p.Name === playerName);
      return {
        season: season.season,
        player: player,
        roleScores: player?.roleScores || {}
      };
    }).filter(history => history.player); // Only return seasons where player exists
  };

  const clearSquadData = () => {
    setPlayers([]);
    localStorage.removeItem('fm24-squad');
  };

  const clearAllHistoricalData = () => {
    setPlayers([]);
    setSeasons([]);
    setCurrentSeason(1);
    localStorage.removeItem('fm24-squad');
    localStorage.removeItem('fm24-seasons');
    localStorage.removeItem('fm24-current-season');
  };

  const getPlayersByRole = (role) => {
    return players
      .filter(player => player.roleScores && player.roleScores[role])
      .sort((a, b) => b.roleScores[role] - a.roleScores[role]);
  };

  const getBestPlayerForRole = (role) => {
    const playersForRole = getPlayersByRole(role);
    return playersForRole.length > 0 ? playersForRole[0] : null;
  };

  // Add or update a tag for a player
  const setPlayerTag = (playerId, tagType, tagValue) => {
    setPlayers(prevPlayers => prevPlayers.map(player =>
      player.id === playerId ? { ...player, [tagType]: tagValue } : player
    ));
  };

  const value = {
    players,
    loading,
    seasons,
    currentSeason,
    importSquadData,
    clearSquadData,
    clearAllHistoricalData,
    createNewSeason,
    switchToSeason,
    getSeasonData,
    getAllSeasons,
    getPlayerHistory,
    getPlayersByRole,
    getBestPlayerForRole,
    setPlayerTag,
  };

  return (
    <SquadContext.Provider value={value}>
      {children}
    </SquadContext.Provider>
  );
}; 