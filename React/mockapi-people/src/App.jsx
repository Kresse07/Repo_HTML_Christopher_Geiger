//Code mit Erweiterung um City
import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'https://68f726b9f7fb897c6614ada1.mockapi.io/people';

export default function PeopleApp() {
  // States für Daten, Suche und Formular
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState('');
  //City in die FormData eingeben
  const [formData, setFormData] = useState({ name: '', title: '', city: '' });
  const [editingId, setEditingId] = useState(null);

  // 1. Daten von API laden
  const fetchPeople = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setPeople(data);
  };

  // Wird beim Start der App ausgeführt
  useEffect(() => { fetchPeople(); }, []);

  // 2. Speichern oder Aktualisieren
  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    //city ebenfalls leeren
    setFormData({ name: '', title: '', city:'' }); // Formular leeren
    setEditingId(null);
    fetchPeople(); // Liste aktualisieren
  };

  // 3. Löschen
  const deletePerson = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchPeople();
  };

  // Suche filtern
  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-container">
      <h1>Mitarbeiter Liste</h1>

      {/* Eingabebereich */}
      <form className="input-section" onSubmit={handleSubmit}>
        <input 
          placeholder="Name" value={formData.name} 
          onChange={(e) => setFormData({...formData, name: e.target.value})} required 
        />
        <input 
          placeholder="Job" value={formData.title} 
          onChange={(e) => setFormData({...formData, title: e.target.value})} required 
        />
        {/* City Eingabefeld */}
        <input 
          placeholder="City" value={formData.city} 
          onChange={(e) => setFormData({...formData, city: e.target.value})} required 
        />
        <button type="submit">
          {editingId ? 'Änderung Speichern' : 'Hinzufügen'}
        </button>
      </form>

      {/* Suchfeld */}
      <input 
        className="search-input"
        placeholder="🔍 Suchen..." 
        onChange={(e) => setSearch(e.target.value)} 
        style={{width: '100%', marginBottom: '20px'}}
      />

      {/* Ausgabe der Zeilen */}
      {filteredPeople.map(person => (
        <div key={person.id} className="person-row">
          <img src={person.avatar} alt="Profil" className="avatar" />
          <div className="info">
            <span className="name">{person.name}</span>
            <span className="title">{person.title}</span>
            {/* Ausgabe von City */}
            <span className="city">
              📍{person.city}</span>
          </div>
          <div className="buttons">
            <button className="edit-btn" onClick={() => {setEditingId(person.id); setFormData(person)}}>Edit</button>
            <button className="delete-btn" onClick={() => deletePerson(person.id)}>Löschen</button>
          </div>
        </div>
      ))}
    </div>
  );
}