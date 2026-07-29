const API_URL = "http://127.0.0.1:5000/api/categorias";

export async function obtenerCategorias() {
  const respuesta = await fetch(`${API_URL}/`);
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudieron obtener las categorías"
    );
  }

  return datos.categorias;
}

export async function crearCategoria(categoria) {
  const respuesta = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoria),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudo crear la categoría"
    );
  }

  return datos.categoria;
}

export async function editarCategoria(id, categoria) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(categoria),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudo actualizar la categoría"
    );
  }

  return datos.categoria;
}

export async function eliminarCategoria(id) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudo eliminar la categoría"
    );
  }

  return datos;
}