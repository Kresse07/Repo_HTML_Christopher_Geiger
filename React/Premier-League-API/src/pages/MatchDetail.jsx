import React, { useEffect, useState } from 'react';

const MatchDetail = ({ teamName, onBack }) => {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Huddersfield-Logo als Fallback, falls die API kein Bild liefert
  const fallbackLogo = "/Huddersfield.png";

  useEffect(() => {
    async function loadMatchDetails() {
      setLoading(true);
      try {
        // Holt alle Spiele des gewählten Teams für 2018
        const res = await fetch(`https://api.openligadb.de/getmatchdata/enpl/2018/${encodeURIComponent(teamName)}`);
        const matches = await res.json();
        
        // Findet das Spiel vom 1. Spieltag (wie in deiner navigation.js)
        const firstMatch = matches.find(m => m.group?.groupOrderID === 1 || m.group?.groupName.includes("1. Spieltag"));
        
        setMatch(firstMatch);
      } catch (error) {
        console.error("Fehler beim Laden der Matchdetails:", error);
      } finally {
        setLoading(false);
      }
    }

    if (teamName) {
      loadMatchDetails();
    }
  }, [teamName]);

  if (loading) return <div className="p-10 text-center text-2xl">Lade Match-Details...</div>;
  if (!match) return <div className="p-10 text-center text-2xl">Kein Spiel für den 1. Spieltag gefunden.</div>;

  // Extrahiert Tore und Daten wie in deinem Original-Script
  const goalsTeam1 = match.matchResults?.[0]?.pointsTeam1 ?? "-";
  const goalsTeam2 = match.matchResults?.[0]?.pointsTeam2 ?? "-";
  const matchDate = new Date(match.matchDateTime).toLocaleDateString("de-DE");

  return (
    <div className="w-full flex flex-col items-center min-h-screen bg-white font-['Poppins']">
      <div className="relative w-full h-[832px] overflow-hidden bg-white shrink-0">
        
        {/* Header: Logo & Text */}
        <img 
          src="/image1849-5f7s-200h.png" 
          alt="Logo" 
          className="absolute top-[67px] left-[48px] w-[194px] h-[109px] object-contain"
        />
        <span className="absolute top-[82px] left-[215px] text-[#880c9e] text-[36px] font-bold leading-normal">
          Premier<br />League
        </span>

        {/* Scoreboard */}
        <div className="absolute top-[280px] left-[368px] w-[543px] h-[271px] bg-[#e0e0e0] rounded-[35px]">
          
          {/* Spieltag Info */}
          <span className="absolute top-[8px] left-[33px] text-black text-[20px] font-semibold">
            {match.group?.groupName || "Spieltag"}
          </span>

          {/* Datum */}
          <span className="absolute top-[8px] left-[432px] text-black text-[20px] font-semibold w-[116px]">
            {matchDate}
          </span>

          {/* Team Logos mit Huddersfield-Check */}
          <img 
            src={match.team1.teamIconUrl?.includes("Huddersfield") ? fallbackLogo : (match.team1.teamIconUrl || fallbackLogo)} 
            alt="Team 1" 
            className="absolute top-[101px] left-[53px] h-[96px] w-[96px] object-contain"
          />
          <img 
            src={match.team2.teamIconUrl?.includes("Huddersfield") ? fallbackLogo : (match.team2.teamIconUrl || fallbackLogo)} 
            alt="Team 2" 
            className="absolute top-[101px] left-[363px] h-[96px] w-[96px] object-contain"
          />

          {/* Ergebnis */}
          <span className="absolute top-[83px] left-[203px] text-black text-[96px] font-bold w-[140px] text-center">
            {goalsTeam1}:{goalsTeam2}
          </span>

          {/* Team Namen */}
          <span className="absolute top-[197px] left-[102px] -translate-x-1/2 text-black text-[20px] font-semibold whitespace-nowrap text-center w-[180px]">
            {match.team1.shortName}
          </span>
          <span className="absolute top-[197px] left-[412px] -translate-x-1/2 text-black text-[20px] font-semibold whitespace-nowrap text-center w-[180px]">
            {match.team2.shortName}
          </span>
        </div>

        {/* Zurück-Pfeil (nutzt dein download-icon) */}
        <img 
          src="/download23116-466a-200h.png" 
          alt="back" 
          className="absolute top-[46px] left-[1155px] w-[76px] h-[76px] cursor-pointer hover:scale-110 transition-transform"
          onClick={onBack} 
        />
      </div>
    </div>
  );
};

export default MatchDetail;