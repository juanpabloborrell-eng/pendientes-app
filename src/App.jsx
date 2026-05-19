import { useEffect, useState } from 'react'
import Login from './Components/Login'
import MisPendientes from './Components/MisPendientes'
import PanelEmisor from './Components/PanelEmisor'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const guardado = localStorage.getItem('pendientes_user')

    if (guardado) {
      setUser(JSON.parse(guardado))
    }
  }, [])

  function handleLogin(usuario) {
    setUser(usuario)
    localStorage.setItem('pendientes_user', JSON.stringify(usuario))
  }

  function logout() {
    localStorage.removeItem('pendientes_user')
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const esEmisor = user.rol === 'emisor' || user.rol === 'ambos'
  const esDestinatario = user.rol === 'destinatario' || user.rol === 'ambos'

  return (
    <div className="app-page">
      <div className="app-shell">
        <header className="app-header">
          <div>
            <img src="/logo.png" alt="Logo" className="header-logo" />
            <h1>{esEmisor ? 'Pendientes' : 'Mis pendientes'}</h1>
            <p>{user.nombre}</p>
          </div>

          <button className="logout-button" onClick={logout}>
            Salir
          </button>
        </header>

        {esEmisor && <PanelEmisor user={user} />}

        {!esEmisor && esDestinatario && <MisPendientes user={user} />}
      </div>
    </div>
  )
}