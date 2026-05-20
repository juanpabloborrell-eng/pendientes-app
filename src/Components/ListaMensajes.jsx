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

  if (!modoEmisor) {
    return (
      <div className="receptor-sheet">
        <div className="receptor-title">Mis mensajes </div>

        {mensajes.map((item, index) => (
          <div
            key={item.id}
            className={`mobile-task-row ${item.estado === 'pendiente' ? 'pending' : ''}`}
          >
            <div className="mobile-task-number">{index + 1}</div>

            <div className="mobile-task-main">
              <div className="mobile-task-message">{item.mensaje.texto}</div>
              <div className="mobile-task-info">
                <strong>Emisor:</strong> {item.mensaje.emisor?.nombre} · {formatFecha(item.mensaje.created_at)}
              </div>
            </div>

            <div className="mobile-task-actions">
              <button
                className="mobile-icon-btn done"
                onClick={() => onCambiarEstado(item.id, item.estado === 'cumplido' ? 'pendiente' : 'cumplido')}
              >
                ✓
              </button>

              <button
                className="mobile-icon-btn obs"
                onClick={() => onCambiarEstado(item.id, item.estado === 'observado' ? 'pendiente' : 'observado')}
              >
                👁
              </button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="messages-area">
      {mensajes.map((item) => {
        const puedeEliminar =
          item.estado === 'cumplido' &&
          item.mensaje.emisor_id === user.id

        return (
          <div key={item.id} className="message-bubble">
            <div className="message-meta">
              {formatFecha(item.mensaje.created_at)} · {item.mensaje.emisor?.nombre}
            </div>

            <div className="message-text">{item.mensaje.texto}</div>

            <div className="status-row">
              <span className="badge-read">{item.leido ? 'Leído ✓' : 'No leído'}</span>
              <span className={`badge-status ${item.estado}`}>{labelEstado(item.estado)}</span>
            </div>

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
  const hoy = new Date()
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const inicioAyer = new Date(inicioHoy)
  inicioAyer.setDate(inicioHoy.getDate() - 1)

  const hora = d.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (d >= inicioHoy) return `Hoy ${hora}`
  if (d >= inicioAyer) return `Ayer ${hora}`

  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
  }) + ` ${hora}`
}