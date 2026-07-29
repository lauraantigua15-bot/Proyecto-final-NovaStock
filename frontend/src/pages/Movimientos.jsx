import { useEffect, useState } from "react"
import { obtenerProductos } from "../services/productosService"
import {
  obtenerMovimientos,
  registrarMovimiento,
} from "../services/movimientosService"

function Movimientos({ usuario, volverInicio }) {
  const [productos, setProductos] = useState([])
  const [movimientos, setMovimientos] = useState([])

  const [productoId, setProductoId] = useState("")
  const [tipo, setTipo] = useState("Entrada")
  const [cantidad, setCantidad] = useState("")
  const [motivo, setMotivo] = useState("")

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [tipoMensaje, setTipoMensaje] = useState("")

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    try {
      setCargando(true)
      setMensaje("")

      const [datosProductos, datosMovimientos] = await Promise.all([
        obtenerProductos(),
        obtenerMovimientos(),
      ])

      setProductos(datosProductos || [])
      setMovimientos(datosMovimientos || [])
    } catch (error) {
      mostrarMensaje(error.message, "error")
    } finally {
      setCargando(false)
    }
  }

  function mostrarMensaje(texto, tipo) {
    setMensaje(texto)
    setTipoMensaje(tipo)

    setTimeout(() => {
      setMensaje("")
      setTipoMensaje("")
    }, 5000)
  }

  function obtenerNombreUsuario() {
    const nombre = usuario?.nombre?.trim()
    const apellido = usuario?.apellido?.trim()

    if (nombre && apellido) {
      return `${nombre} ${apellido}`
    }

    if (nombre) {
      return nombre
    }

    if (usuario?.correo) {
      return usuario.correo
    }

    return "Usuario"
  }

  const productoSeleccionado = productos.find(
    (producto) => producto.id === productoId
  )

  async function manejarRegistro(evento) {
    evento.preventDefault()

    if (!productoId) {
      mostrarMensaje("Debes seleccionar un producto", "error")
      return
    }

    const cantidadNumerica = Number(cantidad)

    if (
      !Number.isInteger(cantidadNumerica) ||
      cantidadNumerica <= 0
    ) {
      mostrarMensaje(
        "La cantidad debe ser un número entero mayor que cero",
        "error"
      )
      return
    }

    if (!productoSeleccionado) {
      mostrarMensaje("El producto seleccionado no existe", "error")
      return
    }

    const stockDisponible =
      Number(productoSeleccionado.cantidad) || 0

    if (
      tipo === "Salida" &&
      cantidadNumerica > stockDisponible
    ) {
      mostrarMensaje(
        `Stock insuficiente. Disponible: ${stockDisponible}`,
        "error"
      )
      return
    }

    try {
      setGuardando(true)

      const respuesta = await registrarMovimiento({
        producto_id: productoId,
        tipo,
        cantidad: cantidadNumerica,
        motivo: motivo.trim(),
        usuario: obtenerNombreUsuario(),
      })

      setProductoId("")
      setTipo("Entrada")
      setCantidad("")
      setMotivo("")

      await cargarDatos()

      mostrarMensaje(
        respuesta.mensaje ||
          "Movimiento registrado correctamente",
        "exito"
      )
    } catch (error) {
      mostrarMensaje(error.message, "error")
    } finally {
      setGuardando(false)
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) {
      return "Sin fecha"
    }

    const fechaMovimiento = new Date(fecha)

    return fechaMovimiento.toLocaleString("es-DO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalEntradas = movimientos
    .filter((movimiento) => movimiento.tipo === "Entrada")
    .reduce(
      (total, movimiento) =>
        total + Number(movimiento.cantidad || 0),
      0
    )

  const totalSalidas = movimientos
    .filter((movimiento) => movimiento.tipo === "Salida")
    .reduce(
      (total, movimiento) =>
        total + Number(movimiento.cantidad || 0),
      0
    )

  const valorMayor = Math.max(
    totalEntradas,
    totalSalidas,
    1
  )

  const porcentajeEntradas =
    (totalEntradas / valorMayor) * 100

  const porcentajeSalidas =
    (totalSalidas / valorMayor) * 100

  return (
    <div className="movimientos-page">
      <header className="productos-header">
        <div>
          <button
            type="button"
            className="back-button"
            onClick={volverInicio}
          >
            ← Volver al inicio
          </button>

          <h2>Movimientos de inventario</h2>

          <p>
            Registra entradas y salidas de productos.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={cargarDatos}
          disabled={cargando || guardando}
        >
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </header>

      {mensaje && (
        <div
          className={
            tipoMensaje === "exito"
              ? "productos-message success"
              : "productos-message error"
          }
        >
          {mensaje}
        </div>
      )}

      <section className="stats-grid movimientos-stats">
        <article className="stat-card">
          <p>Total de movimientos</p>
          <h3>{cargando ? "..." : movimientos.length}</h3>
          <span>Registros guardados</span>
        </article>

        <article className="stat-card">
          <p>Unidades de entrada</p>
          <h3>{cargando ? "..." : totalEntradas}</h3>
          <span>Unidades agregadas</span>
        </article>

        <article className="stat-card">
          <p>Unidades de salida</p>
          <h3>{cargando ? "..." : totalSalidas}</h3>
          <span>Unidades retiradas</span>
        </article>
      </section>

      <section className="dashboard-panel movimientos-chart-panel">
        <div className="panel-header">
          <div>
            <h3>Gráfico de entradas y salidas</h3>
            <p>
              Comparación de las unidades registradas.
            </p>
          </div>
        </div>

        <div className="movimientos-chart">
          <div className="chart-row">
            <div className="chart-label">
              <span>Entradas</span>
              <strong>{totalEntradas}</strong>
            </div>

            <div className="chart-track">
              <div
                className="chart-bar entrada"
                style={{
                  width: `${porcentajeEntradas}%`,
                  backgroundColor: "#22c55e",
                }}
              />
            </div>
          </div>

          <div className="chart-row">
            <div className="chart-label">
              <span>Salidas</span>
              <strong>{totalSalidas}</strong>
            </div>

            <div className="chart-track">
              <div
                className="chart-bar salida"
                style={{
                  width: `${porcentajeSalidas}%`,
                  backgroundColor: "#ef4444",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="movimientos-content">
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Registrar movimiento</h3>
              <p>Completa los datos del movimiento.</p>
            </div>
          </div>

          <form
            className="movimiento-form"
            onSubmit={manejarRegistro}
          >
            <div className="form-group">
              <label htmlFor="producto">
                Producto
              </label>

              <select
                id="producto"
                value={productoId}
                onChange={(evento) =>
                  setProductoId(evento.target.value)
                }
                disabled={guardando || cargando}
              >
                <option value="">
                  Selecciona un producto
                </option>

                {productos.map((producto) => (
                  <option
                    key={producto.id}
                    value={producto.id}
                  >
                    {producto.nombre} - Stock:{" "}
                    {producto.cantidad}
                  </option>
                ))}
              </select>
            </div>

            {productoSeleccionado && (
              <div className="producto-stock-info">
                <div>
                  <span>Producto</span>
                  <strong>
                    {productoSeleccionado.nombre}
                  </strong>
                </div>

                <div>
                  <span>Stock disponible</span>
                  <strong>
                    {productoSeleccionado.cantidad}{" "}
                    unidad(es)
                  </strong>
                </div>
              </div>
            )}

            <div className="movimiento-form-grid">
              <div className="form-group">
                <label htmlFor="tipo">
                  Tipo de movimiento
                </label>

                <select
                  id="tipo"
                  value={tipo}
                  onChange={(evento) =>
                    setTipo(evento.target.value)
                  }
                  disabled={guardando}
                >
                  <option value="Entrada">
                    Entrada
                  </option>

                  <option value="Salida">
                    Salida
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="cantidad">
                  Cantidad
                </label>

                <input
                  id="cantidad"
                  type="number"
                  min="1"
                  step="1"
                  value={cantidad}
                  onChange={(evento) =>
                    setCantidad(evento.target.value)
                  }
                  placeholder="Ejemplo: 5"
                  disabled={guardando}
                />
              </div>
            </div>            <div className="form-group">
              <label htmlFor="motivo">
                Motivo
              </label>

              <textarea
                id="motivo"
                value={motivo}
                onChange={(evento) =>
                  setMotivo(evento.target.value)
                }
                placeholder="Ejemplo: Compra al proveedor"
                rows="4"
                disabled={guardando}
              />
            </div>

            <div className="movimiento-preview">
              <span>Nuevo stock</span>

              {!productoSeleccionado ||
              !cantidad ||
              Number(cantidad) <= 0 ? (
                <p>
                  Selecciona un producto y coloca la
                  cantidad.
                </p>
              ) : (
                <p>
                  El stock cambiará de{" "}
                  <strong>
                    {Number(
                      productoSeleccionado.cantidad
                    ) || 0}
                  </strong>{" "}
                  a{" "}
                  <strong>
                    {tipo === "Entrada"
                      ? (Number(
                          productoSeleccionado.cantidad
                        ) || 0) + Number(cantidad)
                      : (Number(
                          productoSeleccionado.cantidad
                        ) || 0) - Number(cantidad)}
                  </strong>{" "}
                  unidad(es).
                </p>
              )}
            </div>

            <button
              type="submit"
              className="primary-button movimiento-submit"
              disabled={guardando || cargando}
            >
              {guardando
                ? "Registrando..."
                : "Registrar movimiento"}
            </button>
          </form>
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Historial de movimientos</h3>

              <p>
                Entradas y salidas registradas.
              </p>
            </div>
          </div>

          {cargando ? (
            <div className="empty-state">
              <h4>Cargando movimientos...</h4>
            </div>
          ) : movimientos.length === 0 ? (
            <div className="empty-state">
              <h4>
                No hay movimientos registrados
              </h4>

              <p>
                Registra una entrada o salida.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="movimientos-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Motivo</th>
                    <th>Usuario</th>
                  </tr>
                </thead>

                <tbody>
                  {movimientos.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td>
                        {formatearFecha(
                          movimiento.fecha
                        )}
                      </td>

                      <td>
                        <strong>
                          {movimiento.producto_nombre}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            movimiento.tipo === "Entrada"
                              ? "movement-badge entrada"
                              : "movement-badge salida"
                          }
                        >
                          {movimiento.tipo}
                        </span>
                      </td>

                      <td>
                        <strong
                          className={
                            movimiento.tipo === "Entrada"
                              ? "movement-quantity entrada"
                              : "movement-quantity salida"
                          }
                        >
                          {movimiento.tipo === "Entrada"
                            ? "+"
                            : "-"}
                          {movimiento.cantidad}
                        </strong>
                      </td>

                      <td>
                        {movimiento.motivo ||
                          "Sin motivo"}
                      </td>

                      <td>
                        {movimiento.usuario ||
                          "Usuario"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </div>
  )
}

export default Movimientos