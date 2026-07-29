from flask import Blueprint, jsonify, request
from config.supabase import supabase_admin

movimientos_bp = Blueprint("movimientos", __name__)


@movimientos_bp.route("/", methods=["GET"])
def obtener_movimientos():
    try:
        respuesta = (
            supabase_admin
            .table("movimientos")
            .select("*")
            .order("fecha", desc=True)
            .execute()
        )

        return jsonify({
            "mensaje": "Movimientos obtenidos correctamente",
            "movimientos": respuesta.data
        }), 200

    except Exception as error:
        print("ERROR AL OBTENER MOVIMIENTOS:", error)

        return jsonify({
            "mensaje": "No se pudieron obtener los movimientos",
            "error": str(error)
        }), 500


@movimientos_bp.route("/", methods=["POST"])
def crear_movimiento():
    datos = request.get_json(silent=True)

    if not datos:
        return jsonify({
            "mensaje": "Debes enviar los datos en formato JSON"
        }), 400

    producto_id = str(datos.get("producto_id", "")).strip()
    tipo = str(datos.get("tipo", "")).strip().capitalize()
    cantidad = datos.get("cantidad")
    motivo = str(datos.get("motivo", "")).strip()
    usuario = str(datos.get("usuario", "")).strip()

    if not producto_id:
        return jsonify({
            "mensaje": "Debes seleccionar un producto"
        }), 400

    if tipo not in ["Entrada", "Salida"]:
        return jsonify({
            "mensaje": "El tipo debe ser Entrada o Salida"
        }), 400

    try:
        cantidad = int(cantidad)
    except (TypeError, ValueError):
        return jsonify({
            "mensaje": "La cantidad debe ser un número entero"
        }), 400

    if cantidad <= 0:
        return jsonify({
            "mensaje": "La cantidad debe ser mayor que cero"
        }), 400

    if not usuario:
        return jsonify({
            "mensaje": "El usuario es obligatorio"
        }), 400

    try:
        producto_respuesta = (
            supabase_admin
            .table("productos")
            .select("*")
            .eq("id", producto_id)
            .execute()
        )

        if not producto_respuesta.data:
            return jsonify({
                "mensaje": "Producto no encontrado"
            }), 404

        producto = producto_respuesta.data[0]

        cantidad_actual = int(producto.get("cantidad") or 0)

        if tipo == "Entrada":
            nueva_cantidad = cantidad_actual + cantidad

        else:
            if cantidad > cantidad_actual:
                return jsonify({
                    "mensaje": (
                        f"Stock insuficiente. Disponible: "
                        f"{cantidad_actual} unidad(es)"
                    )
                }), 400

            nueva_cantidad = cantidad_actual - cantidad

        producto_actualizado = (
            supabase_admin
            .table("productos")
            .update({
                "cantidad": nueva_cantidad
            })
            .eq("id", producto_id)
            .execute()
        )

        if not producto_actualizado.data:
            return jsonify({
                "mensaje": "No se pudo actualizar el stock del producto"
            }), 500

        movimiento_respuesta = (
            supabase_admin
            .table("movimientos")
            .insert({
                "producto_id": producto_id,
                "producto_nombre": producto.get("nombre"),
                "tipo": tipo,
                "cantidad": cantidad,
                "motivo": motivo or None,
                "usuario": usuario
            })
            .execute()
        )

        if not movimiento_respuesta.data:
            (
                supabase_admin
                .table("productos")
                .update({
                    "cantidad": cantidad_actual
                })
                .eq("id", producto_id)
                .execute()
            )

            return jsonify({
                "mensaje": "No se pudo guardar el movimiento"
            }), 500

        return jsonify({
            "mensaje": "Movimiento registrado correctamente",
            "movimiento": movimiento_respuesta.data[0],
            "producto": {
                "id": producto_id,
                "nombre": producto.get("nombre"),
                "cantidad_anterior": cantidad_actual,
                "cantidad_actual": nueva_cantidad
            }
        }), 201

    except Exception as error:
        print("ERROR AL REGISTRAR MOVIMIENTO:", error)

        return jsonify({
            "mensaje": "No se pudo registrar el movimiento",
            "error": str(error)
        }), 500


@movimientos_bp.route(
    "/producto/<string:producto_id>",
    methods=["GET"]
)
def obtener_movimientos_producto(producto_id):
    try:
        respuesta = (
            supabase_admin
            .table("movimientos")
            .select("*")
            .eq("producto_id", producto_id)
            .order("fecha", desc=True)
            .execute()
        )

        return jsonify({
            "mensaje": "Movimientos obtenidos correctamente",
            "movimientos": respuesta.data
        }), 200

    except Exception as error:
        print("ERROR AL OBTENER MOVIMIENTOS DEL PRODUCTO:", error)

        return jsonify({
            "mensaje": "No se pudieron obtener los movimientos",
            "error": str(error)
        }), 500