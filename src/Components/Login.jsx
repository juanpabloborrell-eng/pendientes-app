import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function login(e) {
    e.preventDefault()
    setError('')

    const { data, error } = await supabase
      .from('pendientes_usuarios')
      .select('*')
      .eq('usuario', usuario.trim())
      .eq('password', password)
      .eq('activo', true)
      .single()

    if (error || !data) {
      setError('Usuario o contraseña incorrectos')
      return
    }

    onLogin(data)
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="login-logo" />
        <h1>Pendientes</h1>
        <p>Ingresá con usuario y contraseña</p>

        <form onSubmit={login} className="login-form">
          <input
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <input
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <div className="error">{error}</div>}

          <button>Ingresar</button>
        </form>
      </div>
    </div>
  )
}