// src/components/TeamRow.jsx
import React from 'react';

// Hier kommen die Props in den geschweiften Klammern rein
const TeamRow = ({ team, index, onClick }) => {
  
  // 1. Die Logik für das Bild
  const fallbackLogo = "/Huddersfield.png";
  const isHuddersfield = team.teamName && team.teamName.includes("Huddersfield");
  const logoSrc = isHuddersfield ? fallbackLogo : (team.teamIconUrl || fallbackLogo);

  // 2. Das HTML für EINE EINZIGE Zeile
  return (
    <div 
      className="flex items-center justify-between bg-white p-[10px_14px] rounded-[24px] cursor-pointer hover:bg-gray-50"
      // Wenn geklickt wird Funktion aufrufen
      onClick={() => onClick(team.teamName)}
    >
      <div className="flex items-center gap-[14px]">
        {/* Props: index und team */}
        <span className="w-6 font-bold">{index + 1}</span>
        <img 
          src={logoSrc} 
          alt={team.teamName} 
          className="w-8 h-8 object-contain"
          onError={(e) => { e.target.src = fallbackLogo; }}
        />
        <span className="font-medium">{team.teamName}</span>
      </div>
      <span className="font-bold text-[#880c9e]">{team.points ?? "0"}</span>
    </div>
  );
};

export default TeamRow;