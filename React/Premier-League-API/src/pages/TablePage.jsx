// src/pages/TablePage.jsx
import React, { useEffect, useState } from 'react';
import TeamRow from '../components/TeamRow'; // Import der ausgelagerten Zeilen-Komponente

const TablePage = ({ onTeamClick, onBackClick }) => {
  const [teams, setTeams] = useState([]);

  // Daten laden beim ersten Rendern der Komponente (Mounting)
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("https://api.openligadb.de/getbltable/enpl/2018");
        const data = await res.json();
        setTeams(data);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col items-start p-[20px] bg-white min-h-screen w-full font-['Inter']">
      
      {/* Header Bereich */}
      <div className="relative w-full flex items-center justify-center h-[120px] mb-[10px]">
        
        {/* Zurück-Button */}
        <div 
          className="absolute top-[-20px] left-[-20px] flex items-center cursor-pointer z-50"
          onClick={onBackClick}
        >
          <img 
            src="/image1213-vvzq-200h.png" 
            className="w-[150px] h-[150px] object-contain" 
            alt="Logo" 
          />
          <div className="text-[#880c9e] text-[36px] font-bold font-['Poppins'] leading-none ml-[-15px]">
            Premier<br />League
          </div>
        </div>

        {/* Titel */}
        <div className="absolute top-[25px] flex justify-center w-full pointer-events-none">
          <h1 className="text-[36px] font-bold">Premier League Table</h1>
        </div>
      </div>

      {/* Tabellen Container */}
      <div className="flex flex-wrap gap-[40px] justify-start w-full mt-[10px]">
        
        {/* Linke Spalte (Platz 1-10) */}
        <div className="bg-[#e0e0e0] p-[25px] rounded-[32px] flex flex-col gap-[12px] min-w-[400px]">
          {teams.slice(0, 10).map((team, i) => (
            <TeamRow 
              key={team.teamName}    // Eindeutiger Schlüssel für React-Rendering
              team={team}            // Übergabe des Team-Datenobjekts
              index={i}              // Laufender Index (0-9) für die Platzierung
              onClick={onTeamClick}  // Callback-Funktion für Klick-Events
            />
          ))}
        </div>

        {/* Rechte Spalte (Platz 11-20) */}
        <div className="bg-[#e0e0e0] p-[25px] rounded-[32px] flex flex-col gap-[12px] min-w-[400px]">
          {teams.slice(10, 20).map((team, i) => (
            <TeamRow 
              key={team.teamName} 
              team={team} 
              index={i + 10}         // Offset von +10, damit die Platzierung bei 11 beginnt
              onClick={onTeamClick} 
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default TablePage;