import { useState } from "react"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

function App() {
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario")

    return usuarioGuardado
      ? JSON.parse(usuarioGuardado)
      : null
  })


  function cerrarSesion() {
    localStorage.removeItem("token")
    localStorage.removeItem("usuario")
    setUsuario(null)
  }

  if (!usuario) {
    return <Login setUsuario={setUsuario} />
  }

  return (
    <Dashboard
      usuario={usuario}
      cerrarSesion={cerrarSesion}
    />
  )
}

export default App