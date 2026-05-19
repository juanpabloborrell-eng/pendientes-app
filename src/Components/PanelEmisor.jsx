import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'
import ListaMensajes from './ListaMensajes'
import NuevoMensaje from './NuevoMensaje'

export default function PanelEmisor({ user }) {
  const [destinatarios, setDestinatarios] = useState([])
  const [mensajes, setMensajes] = useState([])
  const [destinatarioActivo, setDestinatarioActivo] = useState(null)
  const [vista, setVista] = useState('destinatarios')
  const [busqueda, setBusqueda] = useState('')
  const [contadores, setContadores] = useState({})

  async function cargarDestinatarios() {
    const { data } = await supabase
      .from('pendientes_usuarios')
      .select('*')
      .in('rol', ['destinatario', 'ambos'])
      .eq('activo', true)
      .order('nombre')

    setDestinatarios(data || [])
  }

  async function cargarContadores() {
    const { data } = await supabase
      .from('pendientes_destinatarios')
      .select(`
        destinatario_id,
        estado,
        mensaje:pendientes_mensajes (
          eliminado
        )
      `)

    const visibles = (data || []).filter((x) => x.mensaje && !x.mensaje.eliminado)

    const resumen = {}

    visibles.forEach((item) => {
      if (!resumen[item.destinatario_id]) {
        resumen[item.destinatario_id] = {
          pendiente: 0,
          cumplido: 0,
          observado: 0,
        }
      }

      resumen[item.destinatario_id][item.estado] += 1
    })

    setContadores(resumen)
  }

  async function cargarPendientesDe(destinatario) {
    setDestinatarioActivo(destinatario)
    setVista('detalle')

    const { data } = await supabase
      .from('pendientes_destinatarios')
      .select(`
        id,
        leido,
        leido_at,
        estado,
        estado_at,
        mensaje:pendientes_mensajes (
          id,
          texto,
          created_at,
          eliminado,
          emisor_id,
          emisor:pendientes_usuarios (nombre)
        )
      `)
      .eq('destinatario_id', destinatario.id)

    const visibles = (data || [])
      .filter((x) => x.mensaje && !x.mensaje.eliminado)
      .sort((a, b) => new Date(b.mensaje.created_at) - new Date(a.mensaje.created_at))

    setMensajes(visibles)
  }

  async function eliminarMensaje(item) {
    if (!confirm('¿Eliminar este mensaje? Se eliminará para todos.')) return

    await supabase
      .from('pendientes_mensajes')
      .update({
        eliminado: true,
        eliminado_at: new Date().toISOString(),
      })
      .eq('id', item.mensaje.id)

    cargarPendientesDe(destinatarioActivo)
    cargarContadores()
  }

  useEffect(() => {
    cargarDestinatarios()
    cargarContadores()
  }, [])

  const destinatariosFiltrados = useMemo(() => {
    return destinatarios.filter((d) =>
      d.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
  }, [destinatarios, busqueda])

  return (
    <div>
      <div className="tabs">
        <button
          className={vista === 'destinatarios' ? 'active' : ''}
          onClick={() => {
            setVista('destinatarios')
            cargarContadores()
          }}
        >
          Destinatarios
        </button>

        <button
          className={vista === 'nuevo' ? 'active' : ''}
          onClick={() => setVista('nuevo')}
        >
          Nuevo mensaje
        </button>
      </div>

      {vista === 'destinatarios' && (
        <div className="recipient-panel">
          <input
            className="search-input"
            placeholder="Buscar destinatario..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="recipient-grid">
            {destinatariosFiltrados.map((d) => {
              const c = contadores[d.id] || {
                pendiente: 0,
                cumplido: 0,
                observado: 0,
              }

              return (
                <button key={d.id} onClick={() => cargarPendientesDe(d)}>
                  <strong>{d.nombre}</strong>

                  <div className="recipient-counts">
  <span className="mini-badge pendiente">P {c.pendiente}</span>
  <span className="mini-badge cumplido">C {c.cumplido}</span>
  <span className="mini-badge observado">O {c.observado}</span>
</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {vista === 'nuevo' && (
        <NuevoMensaje
          user={user}
          destinatarios={destinatarios}
          onEnviado={() => {
            cargarContadores()
            setVista('destinatarios')
          }}
        />
      )}

      {vista === 'detalle' && destinatarioActivo && (
        <div>
          <div className="detail-header">
            <button onClick={() => setVista('destinatarios')}>← Volver</button>
            <strong>Pendientes - {destinatarioActivo.nombre}</strong>
          </div>

          <ListaMensajes
            mensajes={mensajes}
            user={user}
            modoEmisor
            onEliminarMensaje={eliminarMensaje}
          />
        </div>
      )}
    </div>
  )
}