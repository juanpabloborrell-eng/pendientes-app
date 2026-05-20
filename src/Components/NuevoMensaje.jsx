import { useMemo, useState } from 'react'
import { supabase } from '../supabase'

export default function NuevoMensaje({ user, destinatarios, onEnviado }) {
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionados, setSeleccionados] = useState([])
  const [toast, setToast] = useState('')

  const destinatariosFiltrados = useMemo(() => {
    return destinatarios.filter((d) =>
      d.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  }, [destinatarios, busqueda])

  function mostrarToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 1400)
  }

  function toggle(id) {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function toggleTodos() {
    if (seleccionados.length === destinatarios.length) {
      setSeleccionados([])
    } else {
      setSeleccionados(destinatarios.map((d) => d.id))
    }
  }

  async function enviar() {
    if (!texto.trim()) {
      mostrarToast('Escribí un mensaje')
      return
    }

    if (seleccionados.length === 0) {
      mostrarToast('Seleccioná destinatarios')
      return
    }

    const { data: mensaje, error } = await supabase
      .from('pendientes_mensajes')
      .insert({
        texto: texto.trim(),
        emisor_id: user.id,
      })
      .select()
      .single()

    if (error) {
      mostrarToast('Error al crear mensaje')
      return
    }

    const filas = seleccionados.map((destinatario_id) => ({
      mensaje_id: mensaje.id,
      destinatario_id,
    }))

    const { error: errorDestinatarios } = await supabase
      .from('pendientes_destinatarios')
      .insert(filas)

    if (errorDestinatarios) {
      mostrarToast('Error al asignar destinatarios')
      return
    }

    mostrarToast('✓ Mensaje enviado')

    setTexto('')
    setSeleccionados([])

    setTimeout(() => {
      onEnviado()
    }, 2000)
  }

  return (
    <div className="new-message">
      {toast && <div className="toast">{toast}</div>}

      <textarea
        placeholder="Escribir mensaje..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <div className="recipient-tools">
        <input
          placeholder="Buscar destinatario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button onClick={toggleTodos}>
          {seleccionados.length === destinatarios.length ? 'Quitar todos' : 'Todos'}
        </button>
      </div>

      <div className="recipient-grid">
        {destinatariosFiltrados.map((d) => (
          <button
            key={d.id}
            className={seleccionados.includes(d.id) ? 'selected' : ''}
            onClick={() => toggle(d.id)}
          >
            {d.nombre}
          </button>
        ))}
      </div>

      <button className="send-button" onClick={enviar}>
        Enviar mensaje
      </button>
    </div>
  )
}