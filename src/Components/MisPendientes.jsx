import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import ListaMensajes from './ListaMensajes'

export default function MisPendientes({ user }) {
  const [mensajes, setMensajes] = useState([])
  const [filtro, setFiltro] = useState('todos')

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
  }, [])

  const mensajesFiltrados =
    filtro === 'todos'
      ? mensajes
      : mensajes.filter((m) => m.estado === filtro)

  return (
    <div>
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