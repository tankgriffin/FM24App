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

  // Load squad data from localStorage on mount
  useEffect(() => {
    const savedSquad = localStorage.getItem('fm24-squad');
    if (savedSquad) {
      try {
        const parsedSquad = JSON.parse(savedSquad);
        setPlayers(parsedSquad);
      } catch (error) {
        console.error('Error loading saved squad:', error);
      }
    }
  }, []);

  // Save squad data to localStorage whenever players change
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem('fm24-squad', JSON.stringify(players));
    }
  }, [players]);

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
          // Calculate derived stats
          Spd: Math.round((parseInt(playerData.Pace || 0) + parseInt(playerData.Acceleration || 0)) / 2),
          Work: Math.round((parseInt(playerData['Work Rate'] || 0) + parseInt(playerData.Stamina || 0)) / 2),
          SetP: Math.round((parseInt(playerData.Jumping || 0) + parseInt(playerData.Bravery || 0)) / 2),
        };
      });

      setPlayers(playersData);
    } catch (error) {
      console.error('Error importing squad data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearSquadData = () => {
    setPlayers([]);
    localStorage.removeItem('fm24-squad');
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

  const value = {
    players,
    loading,
    importSquadData,
    clearSquadData,
    getPlayersByRole,
    getBestPlayerForRole,
  };

  return (
    <SquadContext.Provider value={value}>
      {children}
    </SquadContext.Provider>
  );
}; 