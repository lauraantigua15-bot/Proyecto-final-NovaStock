import { useEffect, useState } from "react";
import { subirImagenProducto } from "../services/imagenesService";
import { obtenerCategorias } from "../services/categoriasService";

function ProductoForm({
  cerrarFormulario,
  guardarProducto,
  productoEditar,
}) {
  const [formulario, setFormulario] = useState({
    nombre: productoEditar?.nombre || "",
    descripcion: productoEditar?.descripcion || "",
    precio: productoEditar?.precio || "",
    cantidad: productoEditar?.cantidad ?? "",
    categoria: productoEditar?.categoria || "",
    imagen: productoEditar?.imagen || "",
  });

  const [categorias, setCategorias] = useState([]);
  const [cargandoCategorias, setCargandoCategorias] =
    useState(true);

  const [archivoImagen, setArchivoImagen] = useState(null);

  const [vistaPrevia, setVistaPrevia] = useState(
    productoEditar?.imagen || ""
  );

  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const esEdicion = productoEditar !== null;

  useEffect(() => {
    cargarCategorias();
  }, []);

  async function cargarCategorias() {
    try {
      setCargandoCategorias(true);

      const datos = await obtenerCategorias();
      setCategorias(datos || []);
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargandoCategorias(false);
    }
  }

  function manejarCambio(evento) {
    const { name, value } = evento.target;

    setFormulario((formularioActual) => ({
      ...formularioActual,
      [name]: value,
    }));
  }

  function manejarCambioImagen(evento) {
    const archivo = evento.target.files?.[0];

    if (!archivo) {
      return;
    }

    const formatosPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!formatosPermitidos.includes(archivo.type)) {
      setMensaje(
        "Debes seleccionar una imagen JPG, PNG o WEBP."
      );
      return;
    }

    const limiteEnMB = 5;
    const limiteEnBytes = limiteEnMB * 1024 * 1024;

    if (archivo.size > limiteEnBytes) {
      setMensaje(
        "La imagen no puede pesar más de 5 MB."
      );
      return;
    }

    setMensaje("");
    setArchivoImagen(archivo);

    const urlTemporal = URL.createObjectURL(archivo);
    setVistaPrevia(urlTemporal);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (!formulario.categoria) {
      setMensaje(
        "Debes seleccionar una categoría."
      );
      return;
    }

    setMensaje("");
    setCargando(true);

    try {
      let urlImagen = formulario.imagen;

      if (archivoImagen) {
        urlImagen = await subirImagenProducto(
          archivoImagen
        );
      }

      await guardarProducto({
        ...formulario,
        precio: Number(formulario.precio),
        cantidad: Number(formulario.cantidad),
        imagen: urlImagen || "",
      });
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="modal-overlay">
      <section className="producto-form-card">
        <div className="producto-form-header">
          <div>
            <h3>
              {esEdicion
                ? "Editar producto"
                : "Agregar producto"}
            </h3>

            <p>
              {esEdicion
                ? "Modifica los datos del producto"
                : "Completa los datos del nuevo producto"}
            </p>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={cerrarFormulario}
            disabled={cargando}
          >
            ×
          </button>
        </div>

        <form onSubmit={manejarEnvio}>
          <div className="form-group">
            <label htmlFor="nombre">
              Nombre
            </label>

            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formulario.nombre}
              onChange={manejarCambio}
              placeholder="Ejemplo: Monitor Samsung"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">
              Descripción
            </label>

            <textarea
              id="descripcion"
              name="descripcion"
              value={formulario.descripcion}
              onChange={manejarCambio}
              placeholder="Escribe una descripción breve del producto"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precio">
                Precio
              </label>

              <input
                id="precio"
                name="precio"
                type="number"
                min="0"
                step="0.01"
                value={formulario.precio}
                onChange={manejarCambio}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cantidad">
                Cantidad
              </label>

              <input
                id="cantidad"
                name="cantidad"
                type="number"
                min="0"
                step="1"
                value={formulario.cantidad}
                onChange={manejarCambio}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="categoria">
              Categoría
            </label>

            <select
              id="categoria"
              name="categoria"
              value={formulario.categoria}
              onChange={manejarCambio}
              disabled={cargandoCategorias}
              required
            >
              <option value="">
                {cargandoCategorias
                  ? "Cargando categorías..."
                  : "Selecciona una categoría"}
              </option>

              {categorias.map((categoria) => (
                <option
                  key={categoria.id}
                  value={categoria.nombre}
                >
                  {categoria.nombre}
                </option>
              ))}
            </select>

            {!cargandoCategorias &&
              categorias.length === 0 && (
                <small>
                  No hay categorías registradas. Crea una
                  categoría primero.
                </small>
              )}
          </div>

          <div className="form-group">
            <label htmlFor="imagen">
              Imagen del producto
            </label>

            <div className="file-input-container">
              <input
                id="imagen"
                name="imagen"
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={manejarCambioImagen}
              />
            </div>

            <small>
              Selecciona una imagen JPG, PNG o WEBP de
              máximo 5 MB.
            </small>
          </div>

          {vistaPrevia && (
            <div className="imagen-preview-container">
              <p>Vista previa</p>

              <img
                src={vistaPrevia}
                alt="Vista previa del producto"
                className="imagen-preview"
              />
            </div>
          )}

          {mensaje && (
            <p className="productos-message error">
              {mensaje}
            </p>
          )}

          <div className="producto-form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={cerrarFormulario}
              disabled={cargando}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={
                cargando ||
                cargandoCategorias ||
                categorias.length === 0
              }
            >
              {cargando
                ? "Subiendo y guardando..."
                : esEdicion
                  ? "Guardar cambios"
                  : "Guardar producto"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProductoForm;