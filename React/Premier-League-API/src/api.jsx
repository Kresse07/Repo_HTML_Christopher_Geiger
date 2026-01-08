// src/api.js
export async function getTableData() {
    const res = await fetch("https://api.openligadb.de/getbltable/enpl/2018");
    return await res.json();
}

export async function getMatchDetails(teamName) {
    const res = await fetch(`https://api.openligadb.de/getmatchdata/enpl/2018/${encodeURIComponent(teamName)}`);
    const matches = await res.json();
    // Sucht den 1. Spieltag
    return matches.find(m => m.group?.groupOrderID === 1 || m.group?.groupName.includes("1. Spieltag"));
}