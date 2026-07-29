const API_URL = "http://127.0.0.1:5000/api/auth";

export async function iniciarSesion(correo, contrasena) {
  const respuesta = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      correo,
      contrasena,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje);
  }

  return datos;
}