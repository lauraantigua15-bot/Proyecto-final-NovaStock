from flask import Blueprint, jsonify, request
from config.supabase import supabase_admin

productos_bp = Blueprint("productos", __name__)


@productos_bp.route("/", methods=["GET"])
def obtener_productos():
    try:
        respuesta = (
            supabase_admin
            .table("productos")
            .select("*")
            .execute()
        )

        return jsonify({
            "mensaje": "Productos obtenidos correctamente",
            "productos": respuesta.data
        }), 200

    except Exception as error:
        print(error)

        return jsonify({
            "mensaje": "No se pudieron obtener los productos"
        }), 500


@productos_bp.route("/", methods=["POST"])
def crear_producto():
    datos = request.get_json(silent=True)

    if not datos:
        return jsonify({
            "mensaje": "Debes enviar los datos en formato JSON"
        }), 400

    nombre = datos.get("nombre", "").strip()
    descripcion = datos.get("descripcion", "").strip()
    precio = datos.get("precio")
    cantidad = datos.get("cantidad")
    categoria = datos.get("categoria", "").strip()
    imagen = datos.get("imagen", "").strip()

    if not nombre or precio is None or cantidad is None or not categoria:
        return jsonify({
            "mensaje": "Nombre, precio, cantidad y categoría son obligatorios"
        }), 400

    try:
        respuesta = (
            supabase_admin
            .table("productos")
            .insert({
                "nombre": nombre,
                "descripcion": descripcion or None,
                "precio": precio,
                "cantidad": cantidad,
                "categoria": categoria,
                "imagen": imagen or None
            })
            .execute()
        )

        return jsonify({
            "mensaje": "Producto creado correctamente",
            "producto": respuesta.data[0]
        }), 201

    except Exception as error:
        print(error)

        return jsonify({
            "mensaje": "No se pudo crear el producto"
        }), 500


@productos_bp.route("/<string:producto_id>", methods=["DELETE"])
def eliminar_producto(producto_id):
    try:
        respuesta = (
            supabase_admin
            .table("productos")
            .delete()
            .eq("id", producto_id)
            .execute()
        )

        if not respuesta.data:
            return jsonify({
                "mensaje": "Producto no encontrado"
            }), 404

        return jsonify({
            "mensaje": "Producto eliminado correctamente"
        }), 200

    except Exception as error:
        print(error)

        return jsonify({
            "mensaje": "No se pudo eliminar el producto"
        }), 500


@productos_bp.route("/<string:producto_id>", methods=["PUT"])
def editar_producto(producto_id):
    datos = request.get_json(silent=True)

    if not datos:
        return jsonify({
            "mensaje": "Debes enviar los datos en formato JSON"
        }), 400

    nombre = datos.get("nombre", "").strip()
    descripcion = datos.get("descripcion", "").strip()
    precio = datos.get("precio")
    cantidad = datos.get("cantidad")
    categoria = datos.get("categoria", "").strip()
    imagen = datos.get("imagen", "").strip()

    if not nombre or precio is None or cantidad is None or not categoria:
        return jsonify({
            "mensaje": "Nombre, precio, cantidad y categoría son obligatorios"
        }), 400

    try:
        respuesta = (
            supabase_admin
            .table("productos")
            .update({
                "nombre": nombre,
                "descripcion": descripcion or None,
                "precio": precio,
                "cantidad": cantidad,
                "categoria": categoria,
                "imagen": imagen or None
            })
            .eq("id", producto_id)
            .execute()
        )

        if not respuesta.data:
            return jsonify({
                "mensaje": "Producto no encontrado"
            }), 404

        return jsonify({
            "mensaje": "Producto actualizado correctamente",
            "producto": respuesta.data[0]
        }), 200

    except Exception as error:
        print(error)

        return jsonify({
            "mensaje": "No se pudo actualizar el producto"
        }), 500