export const getTeamLogo = (teamName, iconUrl) => {
  const fallbackLogo = "/Huddersfield.png";
  
  // Prüfen, ob teamName existiert und "Huddersfield" enthält
  // ODER ob gar kein iconUrl von der API kommt
  if ((teamName && teamName.includes("Huddersfield")) || !iconUrl) {
    return fallbackLogo;
  }
  
  return iconUrl;
};