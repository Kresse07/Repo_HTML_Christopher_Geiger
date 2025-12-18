import React, { useState, useEffect } from 'react';

// API Link
const API_URL = 'https://68f726b9f7fb897c6614ada1.mockapi.io/people';


// JobCard Komponente
// Zeigt eine einzelne Karte an (Avatar und Jobtitel)
const JobCard = ({ name, title, avatarUrl }) => {
  return (
    <div className="job-card">
      <div className="card-image-container">
        {/* Bild aus der API */}
        <img src={avatarUrl} alt={`Avatar von ${name}`} className="card-image" />
      </div>
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-name">{name}</p>
      </div>
    </div>
  );
};


// Hauptkomponente: JobBoardApp
// Verwaltet Fetching und State

const JobBoardApp = () => {
  const [people, setPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datenabruf mit useEffect
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Fehler! Status: ${response.status}`);
        }
        const data = await response.json();
        
        // Abspeichern der Daten im State
        setPeople(data);
        
      } catch (err) {
        // Fehlerbehandlung
        setError(err.message);
      } finally {
        // Zustand zurücksetzen, sobald der Fetch abgeschlossen ist
        setIsLoading(false);
      }
    };

    fetchPeople();
  }, []); // Wird nur einmal ausgeführt

  // Ladezustand
  if (isLoading) {
    return <div className="loading">Daten werden geladen...</div>;
  }

  // Fehlerzustand
  if (error) {
    return <div className="error">Fehler beim Laden der Daten: {error}</div>;
  }

  // Erfolgsfall: Ausgabe aller Karten
  return (
    <div className="job-board">
      <h1>Mitarbeiter und ihre Positionen</h1>
      <div className="card-container">
        {people.map(person => (
          <JobCard 
            key={person.id} 
            name={person.name} 
            title={person.title} 
            avatarUrl={person.avatar} 
          />
        ))}
      </div>
    </div>
  );
};

export default JobBoardApp;