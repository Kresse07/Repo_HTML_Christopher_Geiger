import React from 'react';
import { getTeamLogo } from '../utils/imageHelper'; // <--- Importieren

const TeamRow = ({ team, index, onClick }) => {
  
  // Logik jetzt über den Helper
  const logoSrc = getTeamLogo(team.teamName, team.teamIconUrl);

  return (
    <div 
      className="flex items-center justify-between bg-white p-[10px_14px] rounded-[24px] cursor-pointer hover:bg-gray-50"
      onClick={() => onClick(team.teamName)}
    >
      <div className="flex items-center gap-[14px]">
        <span className="w-6 font-bold">{index + 1}</span>
        <img 
          src={logoSrc} 
          alt={team.teamName} 
          className="w-8 h-8 object-contain"
          // Fallback, falls das Bild-Laden fehlschlägt (z.B. broken Link)
          onError={(e) => { e.target.src = "/Huddersfield.png"; }}
        />
        <span className="font-medium">{team.teamName}</span>
      </div>
      <span className="font-bold text-[#880c9e]">{team.points ?? "0"}</span>
    </div>
  );
};

export default TeamRow;