import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import ListaMensajes from './ListaMensajes'

export default function MisPendientes({ user }) {
  const [mensajes, setMensajes] = useState([])
  const [filtro, setFiltro] = useState('todos')
  const [nuevos, setNuevos] = useState(0)

  async function cargarMisPendientes() {
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
      .eq('destinatario_id', user.id)

    const visibles = (data || [])
      .filter((x) => x.mensaje && !x.mensaje.eliminado)
      .sort((a, b) => new Date(b.mensaje.created_at) - new Date(a.mensaje.created_at))

    setMensajes(visibles)

    const noLeidos = visibles.filter((x) => !x.leido).map((x) => x.id)
    setNuevos(noLeidos.length)

    if (noLeidos.length > 0) {
      await supabase
        .from('pendientes_destinatarios')
        .update({
          leido: true,
          leido_at: new Date().toISOString(),
        })
        .in('id', noLeidos)

      cargarMisPendientes()
    }
  }

  async function cambiarEstado(id, estado) {
    await supabase
      .from('pendientes_destinatarios')
      .update({
        estado,
        estado_at: new Date().toISOString(),
      })
      .eq('id', id)

    cargarMisPendientes()
  }

  useEffect(() => {
  cargarMisPendientes()

  const channel = supabase
    .channel(`pendientes-destinatario-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pendientes_destinatarios',
        filter: `destinatario_id=eq.${user.id}`,
      },
      () => {
        setTimeout(() => cargarMisPendientes(), 300)
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pendientes_mensajes',
      },
      () => {
        setTimeout(() => cargarMisPendientes(), 300)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])

  const mensajesFiltrados =
    filtro === 'todos'
      ? mensajes
      : mensajes.filter((m) => m.estado === filtro)

  return (
    <div>
      {nuevos > 0 && (
  <div className="new-alert">
    🔔 Tenés {nuevos} pendiente{nuevos > 1 ? 's' : ''} nuevo{nuevos > 1 ? 's' : ''}
  </div>
)}
      <div className="filters">
        <button className={filtro === 'todos' ? 'active' : ''} onClick={() => setFiltro('todos')}>
          Todos
        </button>
        <button className={filtro === 'pendiente' ? 'active' : ''} onClick={() => setFiltro('pendiente')}>
          Pendientes
        </button>
        <button className={filtro === 'cumplido' ? 'active' : ''} onClick={() => setFiltro('cumplido')}>
          Cumplidos
        </button>
        <button className={filtro === 'observado' ? 'active' : ''} onClick={() => setFiltro('observado')}>
          Observados
        </button>
      </div>

      <ListaMensajes
        mensajes={mensajesFiltrados}
        user={user}
        onCambiarEstado={cambiarEstado}
      />
    </div>
  )
}