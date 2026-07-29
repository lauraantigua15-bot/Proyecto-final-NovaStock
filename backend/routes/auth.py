from flask import Blueprint, jsonify, request

from config.supabase import supabase_admin, supabase_auth

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/registro", methods=["POST"])
def registro():
    datos = request.get_json(silent=True)

    if not datos:
        return jsonify({
            "mensaje": "Debes enviar los datos en formato JSON"
        }), 400

    nombre = datos.get("nombre", "").strip()
    correo = datos.get("correo", "").strip().lower()
    contrasena = datos.get("contrasena", "")

    if not nombre or not correo or not contrasena:
        return jsonify({
            "mensaje": "Todos los campos son obligatorios"
        }), 400

    if len(contrasena) < 6:
        return jsonify({
            "mensaje": "La contraseña debe tener al menos 6 caracteres"
        }), 400

    try:
        respuesta = supabase_admin.auth.admin.create_user({
            "email": correo,
            "password": contrasena,
            "email_confirm": True,
            "user_metadata": {
                "nombre": nombre
            }
        })

        usuario = respuesta.user

        return jsonify({
            "mensaje": "Usuario registrado correctamente",
            "usuario": {
                "id": usuario.id,
                "correo": usuario.email,
                "nombre": usuario.user_metadata.get("nombre", "")
            }
        }), 201

    except Exception as error:
        print("Error al registrar usuario:", repr(error))

        mensaje_error = str(error).lower()

        if (
            "already registered" in mensaje_error
            or "already exists" in mensaje_error
            or "user_already_exists" in mensaje_error
        ):
            return jsonify({
                "mensaje": "Este correo ya está registrado"
            }), 409

        return jsonify({
            "mensaje": "No se pudo registrar el usuario"
        }), 400


@auth_bp.route("/login", methods=["POST"])
def login():
    datos = request.get_json(silent=True)

    if not datos:
        return jsonify({
            "mensaje": "Debes enviar los datos en formato JSON"
        }), 400

    correo = datos.get("correo", "").strip().lower()
    contrasena = datos.get("contrasena", "")

    if not correo or not contrasena:
        return jsonify({
            "mensaje": "El correo y la contraseña son obligatorios"
        }), 400

    try:
        respuesta = supabase_auth.auth.sign_in_with_password({
            "email": correo,
            "password": contrasena
        })

        usuario = respuesta.user
        sesion = respuesta.session

        return jsonify({
            "mensaje": "Inicio de sesión exitoso",
            "usuario": {
                "id": usuario.id,
                "correo": usuario.email,
                "nombre": usuario.user_metadata.get("nombre", "")
            },
            "access_token": sesion.access_token
        }), 200

    except Exception as error:
        print("Error al iniciar sesión:", repr(error))

        return jsonify({
            "mensaje": "Correo o contraseña incorrectos"
        }), 401