import { useEffect, useState } from 'react'
import Login from './Components/Login'
import MisPendientes from './Components/MisPendientes'
import PanelEmisor from './Components/PanelEmisor'
import './App.css'

export default function App() {
  const [user, setUser] = useState(null)
  const [modo, setModo] = useState('emisor')

  useEffect(() => {
    const guardado = localStorage.getItem('pendientes_user')
    if (guardado) {
      setUser(JSON.parse(guardado))
    }
  }, [])

  function handleLogin(usuario) {
    setUser(usuario)
    localStorage.setItem('pendientes_user', JSON.stringify(usuario))
    setModo(usuario.rol === 'ambos' ? 'emisor' : usuario.rol)
  }

  function logout() {
    localStorage.removeItem('pendientes_user')
    setUser(null)
    setModo('emisor')
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  const esSoloEmisor = user.rol === 'emisor'
const emailUsuario = user?.email || user?.correo || user?.mail || user?.usuario

const usuariosAmbos = [
  'eradics@porquissimo.com',
  'juanpabloborrell@porquissimo.com',
  'estefania.antunes20@gmail.com',
  'elopez@porquissimo.com',
]

const esAmbos = user.rol === 'ambos' || usuariosAmbos.includes(emailUsuario)

const esSoloEmisor = user.rol === 'emisor' && !esAmbos
const esSoloDestinatario = user.rol === 'destinatario'

  console.log('ROL USUARIO:', user.rol)
console.log('USUARIO:', user)
  return (
    <div className="app-page">
      <div className="app-shell">
        <header className="app-header">
          <div className="header-center">
            <img src="/logo.png" alt="Logo" className="header-logo" />
            <h1>{esSoloDestinatario || modo === 'receptor' ? 'Mis pendientes' : 'Pendientes'}</h1>
            <p>{user.nombre}</p>
          </div>

          <button className="logout-button" onClick={logout}>
            Salir
          </button>
        </header>

        {esAmbos && (
          <div className="tabs">
            <button
              className={modo === 'emisor' ? 'active' : ''}
              onClick={() => setModo('emisor')}
            >
              Enviar pendientes
            </button>

            <button
              className={modo === 'receptor' ? 'active' : ''}
              onClick={() => setModo('receptor')}
            >
              Mis pendientes
            </button>
          </div>
        )}

        {esSoloEmisor && <PanelEmisor user={user} />}

        {esSoloDestinatario && <MisPendientes user={user} />}

        {esAmbos && modo === 'emisor' && <PanelEmisor user={user} />}

        {esAmbos && modo === 'receptor' && <MisPendientes user={user} />}
      </div>
    </div>
  )
}