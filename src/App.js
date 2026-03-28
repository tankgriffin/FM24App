import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SquadList from './pages/SquadList';
import TacticalBoard from './pages/TacticalBoard';
import MatchPlanner from './pages/MatchPlanner';
import HistoricalOverview from './pages/HistoricalOverview';
import Assistant from './pages/Assistant';
import ScoutingPool from './pages/ScoutingPool';
import { SquadProvider } from './contexts/SquadContext';
import { TacticsProvider } from './contexts/TacticsContext';

function App() {
  return (
    <SquadProvider>
      <TacticsProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/squad" element={<SquadList />} />
              <Route path="/tactical-board" element={<TacticalBoard />} />
              <Route path="/match-planner" element={<MatchPlanner />} />
              <Route path="/historical" element={<HistoricalOverview />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/scouting" element={<ScoutingPool />} />
            </Routes>
          </Layout>
        </Router>
      </TacticsProvider>
    </SquadProvider>
  );
}

export default App; 