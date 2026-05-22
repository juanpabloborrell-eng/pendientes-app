import { useMemo, useState } from 'react'
import { supabase } from '../supabase'

export default function NuevoMensaje({ user, destinatarios, onEnviado }) {
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionados, setSeleccionados] = useState([])
  const [toast, setToast] = useState('')
  const [escuchando, setEscuchando] = useState(false)

  const destinatariosFiltrados = useMemo(() => {
    return destinatarios.filter((d) =>
      d.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  }, [destinatarios, busqueda])

  function mostrarToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 1800)
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

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,;:]/g, '')
      .trim()
  }

  function procesarAudio(frase) {
    const fraseNormal = normalizar(frase)

    const encontrados = destinatarios.filter((d) => {
      const nombreNormal = normalizar(d.nombre)
      return fraseNormal.includes(nombreNormal)
    })

    if (encontrados.length > 0) {
      setSeleccionados(encontrados.map((d) => d.id))

      let mensajeLimpio = frase

      encontrados.forEach((d) => {
        const regex = new RegExp(d.nombre, 'gi')
        mensajeLimpio = mensajeLimpio.replace(regex, '')
      })

      mensajeLimpio = mensajeLimpio
        .replace(/^para\s+/i, '')
        .replace(/^a\s+/i, '')
        .replace(/^decile\s+a\s+/i, '')
        .replace(/^mandar\s+a\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim()

      setTexto(mensajeLimpio)
      mostrarToast(`Detectado: ${encontrados.map((d) => d.nombre).join(', ')}`)
    } else {
      setTexto(frase)
      mostrarToast('No detecté destinatario')
    }
  }

  function dictar() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      mostrarToast('El navegador no soporta audio')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-AR'
    recognition.continuous = false
    recognition.interimResults = false

    setEscuchando(true)
    mostrarToast('Escuchando...')

    recognition.onresult = (event) => {
      const frase = event.results[0][0].transcript
      procesarAudio(frase)
      setEscuchando(false)
    }

    recognition.onerror = () => {
      mostrarToast('No pude escuchar el audio')
      setEscuchando(false)
    }

    recognition.onend = () => {
      setEscuchando(false)
    }

    recognition.start()
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
    }, 700)
  }

  return (
    <div className="new-message">
      {toast && <div className="toast">{toast}</div>}

      <button className="voice-button" onClick={dictar}>
        {escuchando ? '🎙️ Escuchando...' : '🎙️ Dictar pendiente'}
      </button>

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