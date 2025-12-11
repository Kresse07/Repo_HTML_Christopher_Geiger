import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DL from './components/Datenliste';

function App() {
  const [count, setCount] = useState(0)
  const [count2, setCount2] = useState(0)
  const daten = ["Essen", "Trinken", "Spielen"];

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Neues</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>

        <DL daten={daten}/>

        <button onClick={() => setCount2((count2) => count2 + 2)}>
          count is {count2}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on Johanna Böhler to learn more about Var1
      </p>
    </>
  )
}

export default App
