import React, { useState } from 'react';
import StartPage from './pages/StartPage';
import TablePage from './pages/TablePage';
import MatchDetail from './pages/MatchDetail';

function App() {
  const [view, setView] = useState('start'); // 'start', 'table', 'detail'
  const [selectedTeam, setSelectedTeam] = useState("");

  return (
    <>
      {view === 'start' && (
        <StartPage onStart={() => setView('table')} />
      )}

      {view === 'table' && (
        <TablePage 
          onBackClick={() => setView('start')} 
          onTeamClick={(teamName) => {
            setSelectedTeam(teamName);
            setView('detail'); // Wechselt zur Match-Ansicht
          }} 
        />
      )}

      {view === 'detail' && (
        <MatchDetail 
          teamName={selectedTeam} 
          onBack={() => setView('table')} // Zurück zur Tabelle
        />
      )}
    </>
  );
}

export default App;