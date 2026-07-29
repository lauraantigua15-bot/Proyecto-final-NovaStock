import { useEffect, useState } from "react";
import {
  obtenerCategorias,
  crearCategoria,
  editarCategoria,
  eliminarCategoria,
} from "../services/categoriasService";
import "../App.css";

function Categorias({ volverInicio }) {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    cargarCategorias();
  }, []);

  async function cargarCategorias() {
    try {
      setMensaje("");
      setCargando(true);

      const datos = await obtenerCategorias();
      setCategorias(datos);
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  function abrirFormularioAgregar() {
    setCategoriaEditar(null);
    setNombre("");
    setDescripcion("");
    setMensaje("");
    setMostrarFormulario(true);
  }

  function abrirFormularioEditar(categoria) {
    setCategoriaEditar(categoria);
    setNombre(categoria.nombre || "");
    setDescripcion(categoria.descripcion || "");
    setMensaje("");
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setCategoriaEditar(null);
    setNombre("");
    setDescripcion("");
  }

  async function manejarGuardar(evento) {
    evento.preventDefault();

    const datosCategoria = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
    };

    if (!datosCategoria.nombre) {
      setMensaje("El nombre de la categoría es obligatorio.");
      return;
    }

    try {
      setMensaje("");

      if (categoriaEditar) {
        const categoriaActualizada = await editarCategoria(
          categoriaEditar.id,
          datosCategoria
        );

        setCategorias((categoriasActuales) =>
          categoriasActuales.map((categoria) =>
            categoria.id === categoriaActualizada.id
              ? {
                  ...categoriaActualizada,
                  cantidad_productos:
                    categoriaActualizada.cantidad_productos ??
                    categoria.cantidad_productos ??
                    0,
                }
              : categoria
          )
        );
      } else {
        const nuevaCategoria = await crearCategoria(datosCategoria);

        setCategorias((categoriasActuales) => [
          {
            ...nuevaCategoria,
            cantidad_productos:
              nuevaCategoria.cantidad_productos ?? 0,
          },
          ...categoriasActuales,
        ]);
      }

      cerrarFormulario();
    } catch (error) {
      setMensaje(error.message);
    }
  }

  async function manejarEliminar(categoria) {
    const cantidadProductos = Number(
      categoria.cantidad_productos ?? 0
    );

    if (cantidadProductos > 0) {
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar la categoría "${categoria.nombre}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      setMensaje("");

      await eliminarCategoria(categoria.id);

      setCategorias((categoriasActuales) =>
        categoriasActuales.filter(
          (categoriaActual) =>
            categoriaActual.id !== categoria.id
        )
      );
    } catch (error) {
      alert(error.message);
    }
  }

  const categoriasFiltradas = categorias.filter((categoria) => {
    const termino = busqueda.toLowerCase().trim();

    return (
      categoria.nombre?.toLowerCase().includes(termino) ||
      categoria.descripcion?.toLowerCase().includes(termino)
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

          <h2>Categorías</h2>
          <p>Administra las categorías de los productos</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={abrirFormularioAgregar}
        >
          Agregar categoría
        </button>
      </header>

      <div className="productos-toolbar">
        <input
          type="text"
          className="productos-search"
          placeholder="Buscar por nombre o descripción..."
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />

        <span className="productos-count">
          {categoriasFiltradas.length} categoría(s)
        </span>
      </div>

      {mensaje && (
        <p className="productos-message">
          {mensaje}
        </p>
      )}

      {cargando ? (
        <div className="productos-status">
          Cargando categorías...
        </div>
      ) : categoriasFiltradas.length === 0 ? (
        <div className="productos-status">
          {busqueda
            ? "No se encontraron categorías."
            : "No hay categorías registradas."}
        </div>
      ) : (
        <div className="table-container">
          <table className="productos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Productos</th>
                <th>Fecha de creación</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {categoriasFiltradas.map((categoria) => {
                const cantidadProductos = Number(
                  categoria.cantidad_productos ?? 0
                );

                const tieneProductos = cantidadProductos > 0;

                return (
                  <tr key={categoria.id}>
                    <td>{categoria.nombre}</td>

                    <td>
                      {categoria.descripcion || "Sin descripción"}
                    </td>

                    <td>
                      {tieneProductos ? (
                        <span className="category-badge category-badge-active">
                          {cantidadProductos}{" "}
                          {cantidadProductos === 1
                            ? "producto"
                            : "productos"}
                        </span>
                      ) : (
                        <span className="category-badge category-badge-empty">
                          Sin productos
                        </span>
                      )}
                    </td>

                    <td>
                      {categoria.fecha_creacion
                        ? new Date(
                            categoria.fecha_creacion
                          ).toLocaleDateString("es-DO")
                        : "Sin fecha"}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            abrirFormularioEditar(categoria)
                          }
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className={
                            tieneProductos
                              ? "delete-button delete-button-disabled"
                              : "delete-button"
                          }
                          onClick={() =>
                            manejarEliminar(categoria)
                          }
                          disabled={tieneProductos}
                          title={
                            tieneProductos
                              ? "Esta categoría tiene productos asociados"
                              : "Eliminar categoría"
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3>
                  {categoriaEditar
                    ? "Editar categoría"
                    : "Agregar categoría"}
                </h3>

                <p>Completa los datos de la categoría</p>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={cerrarFormulario}
              >
                ×
              </button>
            </div>

            <form onSubmit={manejarGuardar}>
              <div className="form-group">
                <label htmlFor="nombreCategoria">
                  Nombre
                </label>

                <input
                  id="nombreCategoria"
                  type="text"
                  value={nombre}
                  onChange={(evento) =>
                    setNombre(evento.target.value)
                  }
                  placeholder="Ejemplo: Tecnología"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcionCategoria">
                  Descripción
                </label>

                <textarea
                  id="descripcionCategoria"
                  value={descripcion}
                  onChange={(evento) =>
                    setDescripcion(evento.target.value)
                  }
                  placeholder="Descripción de la categoría"
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={cerrarFormulario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  {categoriaEditar
                    ? "Guardar cambios"
                    : "Crear categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Categorias;