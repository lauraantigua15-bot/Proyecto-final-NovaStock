import { useEffect, useState } from "react";
import {
  obtenerProductos,
  crearProducto,
  editarProducto,
  eliminarProducto,
} from "../services/productosService";
import ProductoForm from "../components/ProductoForm";
import "../App.css";

function Productos({ volverInicio }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarProductos();
  }, []);

  async function cargarProductos() {
    try {
      setMensaje("");
      setCargando(true);

      const datos = await obtenerProductos();
      setProductos(datos);
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  function abrirFormularioAgregar() {
    setProductoEditar(null);
    setMostrarFormulario(true);
  }

  function abrirFormularioEditar(producto) {
    setProductoEditar(producto);
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setProductoEditar(null);
  }

  async function guardarProducto(datosProducto) {
    if (productoEditar) {
      const productoActualizado = await editarProducto(
        productoEditar.id,
        datosProducto
      );

      setProductos((productosActuales) =>
        productosActuales.map((producto) =>
          producto.id === productoActualizado.id
            ? productoActualizado
            : producto
        )
      );
    } else {
      const nuevoProducto = await crearProducto(datosProducto);

      setProductos((productosActuales) => [
        nuevoProducto,
        ...productosActuales,
      ]);
    }

    cerrarFormulario();
  }

  async function manejarEliminar(producto) {
    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${producto.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await eliminarProducto(producto.id);

      setProductos((productosActuales) =>
        productosActuales.filter(
          (productoActual) => productoActual.id !== producto.id
        )
      );
    } catch (error) {
      alert(error.message);
    }
  }

  const productosFiltrados = productos.filter((producto) => {
    const termino = busqueda.toLowerCase().trim();

    return (
      producto.nombre?.toLowerCase().includes(termino) ||
      producto.categoria?.toLowerCase().includes(termino) ||
      producto.descripcion?.toLowerCase().includes(termino)
    );
  });

  return (
    <section className="productos-page">
      <header className="productos-header">
        <div>
          <button
            type="button"
            className="back-button"
            onClick={volverInicio}
          >
            ← Volver al inicio
          </button>

          <h2>Productos</h2>
          <p>Administra los productos del inventario</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={abrirFormularioAgregar}
        >
          Agregar producto
        </button>
      </header>

      <div className="productos-toolbar">
        <input
          type="text"
          className="productos-search"
          placeholder="Buscar por nombre, categoría o descripción..."
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />

        <span className="productos-count">
          {productosFiltrados.length} producto(s)
        </span>
      </div>

      {mensaje && (
        <p className="productos-message">
          {mensaje}
        </p>
      )}

      {cargando ? (
        <div className="productos-status">
          Cargando productos...
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="productos-status">
          {busqueda
            ? "No se encontraron productos."
            : "No hay productos registrados."}
        </div>
      ) : (
        <div className="table-container">
          <table className="productos-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {productosFiltrados.map((producto) => (
                <tr key={producto.id}>
                  <td>
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="producto-imagen"
                      />
                    ) : (
                      "Sin imagen"
                    )}
                  </td>

                  <td>{producto.nombre}</td>
                  <td>{producto.categoria}</td>

                  <td>
                    RD${" "}
                    {Number(producto.precio).toLocaleString("es-DO")}
                  </td>

                  <td>{producto.cantidad}</td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="edit-button"
                        onClick={() =>
                          abrirFormularioEditar(producto)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => manejarEliminar(producto)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarFormulario && (
        <ProductoForm
          productoEditar={productoEditar}
          cerrarFormulario={cerrarFormulario}
          guardarProducto={guardarProducto}
        />
      )}
    </section>
  );
}

export default Productos;