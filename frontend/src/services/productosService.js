const API_URL = "https://proyecto-final-nova-stock-croj.vercel.app/api/productos";

export async function obtenerProductos() {
  const respuesta = await fetch(`${API_URL}/`);
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudieron obtener los productos"
    );
  }

  return datos.productos;
}

export async function crearProducto(producto) {
  const respuesta = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudo crear el producto"
    );
  }

  return datos.producto;
}

export async function editarProducto(id, producto) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudo actualizar el producto"
    );
  }

  return datos.producto;
}

export async function eliminarProducto(id) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudo eliminar el producto"
    );
  }

  return datos;
}