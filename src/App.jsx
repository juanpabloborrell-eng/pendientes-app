import { useState } from 'react'
import Login from './Components/Login'
import MisPendientes from './Components/MisPendientes'
import PanelEmisor from './Components/PanelEmisor'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)

  if (!user) {
    return <Login onLogin={setUser} />
  }

  const esEmisor = user.rol === 'emisor' || user.rol === 'ambos'
  const esDestinatario = user.rol === 'destinatario' || user.rol === 'ambos'

  return (
    <div className="app-page">
      <div className="app-shell">
        <header className="app-header">
          <div>
            <h1>{esEmisor ? 'Pendientes' : 'Mis pendientes'}</h1>
            <p>{user.nombre}</p>
          </div>

          <button className="logout-button" onClick={() => setUser(null)}>
            Salir
          </button>
        </header>

        {esEmisor && <PanelEmisor user={user} />}

        {!esEmisor && esDestinatario && <MisPendientes user={user} />}
      </div>
    </div>
  )
}