import { useEffect, useState } from "react"
import Productos from "./Productos"
import Categorias from "./Categorias"
import Movimientos from "./Movimientos"
import { obtenerProductos } from "../services/productosService"
import { obtenerCategorias } from "../services/categoriasService"

function Dashboard({
  usuario,
  cerrarSesion,
}) {
  const [vistaActual, setVistaActual] =
    useState("inicio")

  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState("")

  const [
    categoriaSeleccionada,
    setCategoriaSeleccionada,
  ] = useState("Todas")

  useEffect(() => {
    cargarDatosDashboard()
  }, [])

  async function cargarDatosDashboard() {
    try {
      setCargando(true)
      setMensaje("")

      const [datosProductos, datosCategorias] =
        await Promise.all([
          obtenerProductos(),
          obtenerCategorias(),
        ])

      setProductos(datosProductos || [])
      setCategorias(datosCategorias || [])
    } catch (error) {
      setMensaje(error.message)
    } finally {
      setCargando(false)
    }
  }

  function volverAlInicio() {
    setVistaActual("inicio")
    cargarDatosDashboard()
  }

  const nombreUsuario =
    usuario?.nombre?.trim() || "Usuario"

  const totalProductos = productos.length
  const totalCategorias = categorias.length

  const productosStockBajo = productos.filter(
    (producto) => Number(producto.cantidad) <= 5
  ).length

  const valorInventario = productos.reduce(
    (total, producto) => {
      const precio = Number(producto.precio) || 0
      const cantidad = Number(producto.cantidad) || 0

      return total + precio * cantidad
    },
    0
  )

  const productosRecientes = [...productos].slice(0, 5)

  const productosPorCategoria = productos.reduce(
    (resultado, producto) => {
      const nombreCategoria =
        producto.categoria?.trim() || "Sin categoría"

      resultado[nombreCategoria] =
        (resultado[nombreCategoria] || 0) + 1

      return resultado
    },
    {}
  )

  const datosGrafico = Object.entries(
    productosPorCategoria
  )
    .map(([nombre, cantidad]) => ({
      nombre,
      cantidad,
    }))
    .sort((categoriaA, categoriaB) => {
      return categoriaB.cantidad - categoriaA.cantidad
    })

  const datosGraficoFiltrados =
    categoriaSeleccionada === "Todas"
      ? datosGrafico.slice(0, 5)
      : datosGrafico.filter(
          (categoria) =>
            categoria.nombre === categoriaSeleccionada
        )

  const cantidadMayor =
    datosGrafico.length > 0
      ? Math.max(
          ...datosGrafico.map(
            (categoria) => categoria.cantidad
          )
        )
      : 0

  function Sidebar() {
    return (
      <aside className="sidebar">
        <div>
          <h1 className="sidebar-logo">
            NovaStock
          </h1>

          <p className="sidebar-subtitle">
            Gestión de inventario
          </p>
        </div>

        <nav className="sidebar-menu">
          <button
            type="button"
            className={
              vistaActual === "inicio"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={volverAlInicio}
          >
            Inicio
          </button>

          <button
            type="button"
            className={
              vistaActual === "productos"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setVistaActual("productos")
            }
          >
            Productos
          </button>

          <button
            type="button"
            className={
              vistaActual === "categorias"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setVistaActual("categorias")
            }
          >
            Categorías
          </button>

          <button
            type="button"
            className={
              vistaActual === "movimientos"
                ? "menu-item active"
                : "menu-item"
            }
            onClick={() =>
              setVistaActual("movimientos")
            }
          >
            Movimientos
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="logout-button"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    )
  }

  if (vistaActual === "productos") {
    return (
      <main className="dashboard-page">
        <Sidebar />

        <section className="dashboard-main">
          <Productos volverInicio={volverAlInicio} />
        </section>
      </main>
    )
  }

  if (vistaActual === "categorias") {
    return (
      <main className="dashboard-page">
        <Sidebar />

        <section className="dashboard-main">
          <Categorias volverInicio={volverAlInicio} />
        </section>
      </main>
    )
  }

  if (vistaActual === "movimientos") {
    return (
      <main className="dashboard-page">
        <Sidebar />

        <section className="dashboard-main">
          <Movimientos
            usuario={usuario}
            volverInicio={volverAlInicio}
          />
        </section>
      </main>
    )
  }

  return (
    <main className="dashboard-page">
      <Sidebar />

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-welcome">
            <h2>
              ¡Bienvenido, {nombreUsuario}!
            </h2>

            <p>
              Esperamos que tengas un excelente día.
            </p>
          </div>

          <div className="user-info">
            <span>Usuario activo</span>
            <strong>{usuario?.correo}</strong>
          </div>
        </header>

        {mensaje && (
          <p className="productos-message">
            {mensaje}
          </p>
        )}

        <section className="stats-grid">
          <button
            type="button"
            className="stat-card stat-card-clickable"
            onClick={() =>
              setVistaActual("productos")
            }
          >
            <p>Total de productos</p>

            <h3>
              {cargando ? "..." : totalProductos}
            </h3>

            <span>
              Ver productos registrados →
            </span>
          </button>

          <button
            type="button"
            className="stat-card stat-card-clickable"
            onClick={() =>
              setVistaActual("categorias")
            }
          >
            <p>Categorías</p>

            <h3>
              {cargando ? "..." : totalCategorias}
            </h3>

            <span>
              Ver categorías registradas →
            </span>
          </button>

          <button
            type="button"
            className="stat-card stat-card-clickable"
            onClick={() =>
              setVistaActual("productos")
            }
          >
            <p>Stock bajo</p>

            <h3>
              {cargando
                ? "..."
                : productosStockBajo}
            </h3>

            <span>
              Productos con 5 unidades o menos →
            </span>
          </button>

          <button
            type="button"
            className="stat-card stat-card-clickable"
            onClick={() =>
              setVistaActual("productos")
            }
          >
            <p>Valor del inventario</p>

            <h3>
              {cargando
                ? "..."
                : `RD$ ${valorInventario.toLocaleString(
                    "es-DO",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`}
            </h3>

            <span>Consultar inventario →</span>
          </button>
        </section>

        <section className="dashboard-content-grid">
          <section className="dashboard-panel">
            <div className="panel-header">
              <div>
                <h3>Productos recientes</h3>

                <p>
                  Algunos productos registrados en el
                  sistema
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() =>
                  setVistaActual("productos")
                }
              >
                Ver productos
              </button>
            </div>

            {cargando ? (
              <div className="empty-state">
                <h4>Cargando inventario...</h4>
              </div>
            ) : productosRecientes.length === 0 ? (
              <div className="empty-state">
                <h4>
                  No hay productos registrados
                </h4>

                <p>
                  Entra a Productos para agregar
                  artículos al inventario.
                </p>
              </div>
            ) : (
              <div className="recent-products-grid">
                {productosRecientes.map(
                  (producto) => (
                    <article
                      className="recent-product-card"
                      key={producto.id}
                    >
                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="recent-product-image"
                        />
                      ) : (
                        <div className="recent-product-placeholder">
                          Sin imagen
                        </div>
                      )}

                      <div>
                        <h4>{producto.nombre}</h4>

                        <p>{producto.categoria}</p>

                        <span>
                          {producto.cantidad} unidad(es)
                        </span>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>

          <section className="dashboard-panel chart-panel">
            <div className="panel-header categorias-panel-header">
              <div>
                <h3>Productos por categoría</h3>

                <p>
                  Distribución actual del inventario
                </p>
              </div>

              <select
                className="category-filter"
                value={categoriaSeleccionada}
                onChange={(evento) =>
                  setCategoriaSeleccionada(
                    evento.target.value
                  )
                }
              >
                <option value="Todas">
                  Todas
                </option>

                {datosGrafico.map((categoria) => (
                  <option
                    key={categoria.nombre}
                    value={categoria.nombre}
                  >
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>

            {cargando ? (
              <div className="empty-state">
                <h4>Cargando gráfico...</h4>
              </div>
            ) : datosGraficoFiltrados.length === 0 ? (
              <div className="empty-state">
                <h4>No hay datos para mostrar</h4>

                <p>
                  Agrega productos para generar el
                  gráfico.
                </p>
              </div>
            ) : (
              <div className="category-chart category-chart-limited">
                {datosGraficoFiltrados.map(
                  (categoria) => {
                    const porcentaje =
                      cantidadMayor > 0
                        ? (categoria.cantidad /
                            cantidadMayor) *
                          100
                        : 0

                    return (
                      <div
                        className="chart-row"
                        key={categoria.nombre}
                      >
                        <div className="chart-row-header">
                          <span>
                            {categoria.nombre}
                          </span>

                          <strong>
                            {categoria.cantidad}
                          </strong>
                        </div>

                        <div className="chart-track">
                          <div
                            className="chart-bar"
                            style={{
                              width: `${porcentaje}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  }
                )}

                {categoriaSeleccionada === "Todas" &&
                  datosGrafico.length > 5 && (
                    <p className="category-chart-note">
                      Mostrando las 5 categorías con más
                      productos.
                    </p>
                  )}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}

export default Dashboard