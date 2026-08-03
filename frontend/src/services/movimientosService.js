import { API } from "../config";

const API_URL = `${API}/api/movimientos`;

export async function obtenerMovimientos() {
  const respuesta = await fetch(`${API_URL}/`);
  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudieron obtener los movimientos"
    );
  }

  return datos.movimientos || [];
}

export async function registrarMovimiento(movimiento) {
  const respuesta = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(movimiento),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || "No se pudo registrar el movimiento"
    );
  }

  return datos;
}

export async function obtenerMovimientosProducto(productoId) {
  const respuesta = await fetch(
    `${API_URL}/producto/${productoId}`
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        "No se pudieron obtener los movimientos del producto"
    );
  }

  return datos.movimientos || [];
}