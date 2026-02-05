import React, { useState } from 'react';
import './InputTester.css';

const InputTester = () => {
  // 1. Initialer State für alle Formularfelder
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    volume: 50,    // range default
    birthday: '',
    appointment: '', // datetime-local
    monthExample: '',
    timeExample: '',
    weekExample: '',
    website: '',
    phone: '',
    searchQuery: '',
    color: '#000000',
    satisfaction: '', // radio
    newsletter: false, // checkbox
    bio: '',       // textarea
    profilePic: null // file input (speichert nur den Namen im State)
  });

  // 2. State für Validierungs-Fehler
  const [passwordError, setPasswordError] = useState('');

  // 3. Validierungs-Logik (Regex)
  const validatePassword = (password) => {
    // Mind. 8 Zeichen, Klein-, Großbuchstaben, Zahlen, Sonderzeichen
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    
    if (!regex.test(password)) {
      return "Passwort muss mind. 8 Zeichen, Groß-/Kleinbuchstaben, Zahlen und Sonderzeichen enthalten.";
    }
    return ""; // Kein Fehler
  };

  // 4. Generischer Change-Handler
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // State aktualisieren
    setFormData((prevData) => {
      if (type === 'checkbox') {
        return { ...prevData, [name]: checked };
      } else if (type === 'file') {
        return { ...prevData, [name]: files[0] ? files[0].name : null };
      } else {
        return { ...prevData, [name]: value };
      }
    });

    // Live-Validierung für das Passwort
    if (name === 'password') {
      const errorMsg = validatePassword(value);
      setPasswordError(errorMsg);
    }
  };

  // 5. Submit-Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Letzte Sicherheitsprüfung vor dem Senden
    const errorMsg = validatePassword(formData.password);
    if (errorMsg) {
      setPasswordError(errorMsg);
      alert("Formular enthält Fehler!");
      return;
    }

    console.log('--- JSON Output ---');
    console.log(JSON.stringify(formData, null, 2));
    alert('Daten wurden als JSON in die Konsole ausgegeben (F12)');
  };

  return (
    <div className="form-container">
      <h2>React Input Type Showcase</h2>
      <form onSubmit={handleSubmit}>
        
        {/* --- Text Inputs --- */}
        <fieldset>
          <legend>Text & Kontakt</legend>
          <label>
            Username:
            <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Dein Name" />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" />
          </label>
          <label>
            Bio (Textarea):
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows="3" />
          </label>
          <label>
            Website (URL):
            <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
          </label>
          <label>
            Telefon (Tel):
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
          </label>
          <label>
            Suche (Search):
            <input type="search" name="searchQuery" value={formData.searchQuery} onChange={handleChange} />
          </label>
        </fieldset>

        {/* --- Validierung --- */}
        <fieldset>
          <legend>Sicherheit (mit Validierung)</legend>
          <label>
            Passwort:
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              className={passwordError ? 'input-error' : ''}
            />
          </label>
          {passwordError && <span className="error-message">{passwordError}</span>}
        </fieldset>

        {/* --- Zahlen & Slider --- */}
        <fieldset>
          <legend>Zahlen & Slider</legend>
          <label>
            Alter (Number):
            <input type="number" name="age" value={formData.age} onChange={handleChange} />
          </label>
          <label>
            Lautstärke (Range: {formData.volume}):
            <input type="range" name="volume" min="0" max="100" value={formData.volume} onChange={handleChange} />
          </label>
        </fieldset>

        {/* --- Datum & Zeit --- */}
        <fieldset>
          <legend>Datum & Zeit</legend>
          <label>
            Geburtstag (Date):
            <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} />
          </label>
          <label>
            Termin (Datetime-Local):
            <input type="datetime-local" name="appointment" value={formData.appointment} onChange={handleChange} />
          </label>
          <label>
            Monat (Month):
            <input type="month" name="monthExample" value={formData.monthExample} onChange={handleChange} />
          </label>
          <label>
            Uhrzeit (Time):
            <input type="time" name="timeExample" value={formData.timeExample} onChange={handleChange} />
          </label>
          <label>
            Woche (Week):
            <input type="week" name="weekExample" value={formData.weekExample} onChange={handleChange} />
          </label>
        </fieldset>

        {/* --- Auswahl --- */}
        <fieldset>
          <legend>Auswahl & Datei</legend>
          <label>
            Farbe (Color):
            <input type="color" name="color" value={formData.color} onChange={handleChange} />
          </label>
          
          <div className="checkbox-group">
            <label>
              <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleChange} />
              Newsletter abonnieren
            </label>
          </div>

          <div className="radio-group">
            <span>Zufriedenheit:</span>
            <label>
              <input type="radio" name="satisfaction" value="low" onChange={handleChange} /> Niedrig
            </label>
            <label>
              <input type="radio" name="satisfaction" value="high" onChange={handleChange} /> Hoch
            </label>
          </div>

          <label>
            Profilbild (File):
            <input type="file" name="profilePic" onChange={handleChange} />
          </label>
        </fieldset>

        <button type="submit" disabled={!!passwordError}>Als JSON ausgeben</button>
      </form>
    </div>
  );
};

export default InputTester;