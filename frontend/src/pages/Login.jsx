import { useState } from "react"
import "../App.css"

import {
  iniciarSesion,
  registrarUsuario,
} from "../services/authService"


function Login({ setUsuario }) {
  const [modoRegistro, setModoRegistro] = useState(false)

  const [nombre, setNombre] = useState("")
  const [correo, setCorreo] = useState("")
  const [contrasena, setContrasena] = useState("")
  const [confirmarContrasena, setConfirmarContrasena] = useState("")

  const [mensaje, setMensaje] = useState("")
  const [tipoMensaje, setTipoMensaje] = useState("")
  const [cargando, setCargando] = useState(false)


  const limpiarFormulario = () => {
    setNombre("")
    setCorreo("")
    setContrasena("")
    setConfirmarContrasena("")
    setMensaje("")
    setTipoMensaje("")
  }


  const cambiarModo = () => {
    setModoRegistro(!modoRegistro)
    limpiarFormulario()
  }


  const manejarEnvio = async (e) => {
    e.preventDefault()

    setMensaje("")
    setTipoMensaje("")
    setCargando(true)

    try {
      if (modoRegistro) {
        if (contrasena !== confirmarContrasena) {
          throw new Error("Las contraseñas no coinciden")
        }

        if (contrasena.length < 6) {
          throw new Error(
            "La contraseña debe tener al menos 6 caracteres"
          )
        }

        const respuesta = await registrarUsuario(
          nombre,
          correo,
          contrasena
        )

        setMensaje(
          respuesta.mensaje ||
          "Usuario registrado correctamente"
        )

        setTipoMensaje("exito")

        setNombre("")
        setContrasena("")
        setConfirmarContrasena("")

        setModoRegistro(false)
      } else {
        const respuesta = await iniciarSesion(
          correo,
          contrasena
        )

        localStorage.setItem(
          "token",
          respuesta.access_token
        )

        localStorage.setItem(
          "usuario",
          JSON.stringify(respuesta.usuario)
        )

        setUsuario(respuesta.usuario)
      }
    } catch (error) {
      setMensaje(error.message)
      setTipoMensaje("error")
    } finally {
      setCargando(false)
    }
  }


  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-header">
          <h1>NovaStock</h1>

          <p>
            {modoRegistro
              ? "Crea tu cuenta para gestionar el inventario"
              : "Sistema de gestión de inventario"}
          </p>
        </div>

        <form onSubmit={manejarEnvio}>
          {modoRegistro && (
            <div className="form-group">
              <label htmlFor="nombre">
                Nombre completo
              </label>

              <input
                id="nombre"
                type="text"
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="correo">
              Correo electrónico
            </label>

            <input
              id="correo"
              type="email"
              placeholder="admin@novastock.com"
              value={correo}
              onChange={(e) =>
                setCorreo(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contrasena">
              Contraseña
            </label>

            <input
              id="contrasena"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) =>
                setContrasena(e.target.value)
              }
              required
              minLength={6}
            />
          </div>

          {modoRegistro && (
            <div className="form-group">
              <label htmlFor="confirmarContrasena">
                Confirmar contraseña
              </label>

              <input
                id="confirmarContrasena"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmarContrasena}
                onChange={(e) =>
                  setConfirmarContrasena(
                    e.target.value
                  )
                }
                required
                minLength={6}
              />
            </div>
          )}

          {mensaje && (
            <p
              className={
                tipoMensaje === "exito"
                  ? "login-message success-message"
                  : "login-message"
              }
            >
              {mensaje}
            </p>
          )}

          <button type="submit" disabled={cargando}>
            {cargando
              ? modoRegistro
                ? "Registrando..."
                : "Ingresando..."
              : modoRegistro
                ? "Crear cuenta"
                : "Iniciar sesión"}
          </button>
        </form>

        <div className="login-switch">
          <p>
            {modoRegistro
              ? "¿Ya tienes una cuenta?"
              : "¿No tienes una cuenta?"}
          </p>

          <button
            type="button"
            className="login-switch-button"
            onClick={cambiarModo}
            disabled={cargando}
          >
            {modoRegistro
              ? "Iniciar sesión"
              : "Registrarse"}
          </button>
        </div>
      </section>
    </main>
  )
}

export default Login