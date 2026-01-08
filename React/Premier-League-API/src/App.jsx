import React, { useState } from 'react';
import StartPage from './StartPage';
import TablePage from './TablePage';
import MatchDetail from './MatchDetail';

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