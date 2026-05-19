export default function ListaMensajes({
  mensajes,
  user,
  modoEmisor = false,
  onCambiarEstado,
  onEliminarMensaje,
}) {
  if (!mensajes || mensajes.length === 0) {
    return <div className="empty">No hay pendientes.</div>
  }

  return (
    <div className="messages-area">
      {mensajes.map((item) => {
        const puedeEliminar =
          modoEmisor &&
          item.estado === 'cumplido' &&
          item.mensaje.emisor_id === user.id

        return (
          <div key={item.id} className="message-bubble">
            <div className="message-meta">
              {formatFecha(item.mensaje.created_at)} · {item.mensaje.emisor?.nombre}
            </div>

            <div className="message-text">{item.mensaje.texto}</div>

            <div className="status-row">
              <span className="badge-read">
                {item.leido ? 'Leído ✓' : 'No leído'}
              </span>

              <span className={`badge-status ${item.estado}`}>
                {labelEstado(item.estado)}
              </span>
            </div>

            {!modoEmisor && (
              <div className="estado-actions">
                <button
                  className={item.estado === 'pendiente' ? 'active' : ''}
                  onClick={() => onCambiarEstado(item.id, 'pendiente')}
                >
                  Pendiente
                </button>

                <button
                  className={item.estado === 'cumplido' ? 'active' : ''}
                  onClick={() => onCambiarEstado(item.id, 'cumplido')}
                >
                  Cumplido
                </button>

                <button
                  className={item.estado === 'observado' ? 'active' : ''}
                  onClick={() => onCambiarEstado(item.id, 'observado')}
                >
                  Observado
                </button>
              </div>
            )}

            {puedeEliminar && (
              <button className="delete-button" onClick={() => onEliminarMensaje(item)}>
                Eliminar mensaje
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function labelEstado(estado) {
  if (estado === 'cumplido') return 'Cumplido'
  if (estado === 'observado') return 'Observado'
  return 'Pendiente'
}

function formatFecha(value) {
  const d = new Date(value)
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}