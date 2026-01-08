import React, { useEffect, useState } from 'react';

const TablePage = ({ onTeamClick, onBackClick }) => {
  const [teams, setTeams] = useState([]);
  const fallbackLogo = "/Huddersfield.png";

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

  const renderTeamRow = (team, index) => {
    const isHuddersfield = team.teamName && team.teamName.includes("Huddersfield");
    const logoSrc = isHuddersfield ? fallbackLogo : (team.teamIconUrl || fallbackLogo);

    return (
      <div 
        key={team.teamName}
        className="flex items-center justify-between bg-white p-[10px_14px] rounded-[24px] cursor-pointer"
        onClick={() => onTeamClick(team.teamName)}
      >
        <div className="flex items-center gap-[14px]">
          <span className="w-6 font-bold">{index + 1}</span>
          <img 
            src={logoSrc} 
            alt="Logo" 
            className="w-8 h-8 object-contain"
            onError={(e) => { e.target.src = fallbackLogo; }}
          />
          <span className="font-medium">{team.teamName}</span>
        </div>
        <span className="font-bold text-[#880c9e]">{team.points ?? "0"}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-start p-[20px] bg-white min-h-screen w-full font-['Inter']">
      
      {/* Header Bereich - Höhe und Margin reduziert */}
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

        <div className="absolute top-[25px] flex justify-center w-full pointer-events-none">
          <h1 className="text-[36px] font-bold">Premier League Table</h1>
        </div>
      </div>

      {/* Tabellen Container - Abstand von mt-[100px] auf mt-[10px] geändert */}
      <div className="flex flex-wrap gap-[40px] justify-start w-full mt-[10px]">
        
        <div className="bg-[#e0e0e0] p-[25px] rounded-[32px] flex flex-col gap-[12px] min-w-[400px]">
          {teams.slice(0, 10).map((team, i) => renderTeamRow(team, i))}
        </div>

        <div className="bg-[#e0e0e0] p-[25px] rounded-[32px] flex flex-col gap-[12px] min-w-[400px]">
          {teams.slice(10, 20).map((team, i) => renderTeamRow(team, i + 10))}
        </div>

      </div>
    </div>
  );
};

export default TablePage;