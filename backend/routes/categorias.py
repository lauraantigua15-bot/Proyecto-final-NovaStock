from flask import Blueprint, jsonify, request
from config.supabase import supabase_admin

categorias_bp = Blueprint("categorias", __name__)


@categorias_bp.route("/", methods=["GET"])
def obtener_categorias():
    try:
        respuesta_categorias = (
            supabase_admin
            .table("categorias")
            .select("*")
            .order("fecha_creacion", desc=True)
            .execute()
        )

        respuesta_productos = (
            supabase_admin
            .table("productos")
            .select("categoria")
            .execute()
        )

        categorias = respuesta_categorias.data or []
        productos = respuesta_productos.data or []

        for categoria in categorias:
            nombre_categoria = (
                categoria.get("nombre") or ""
            ).strip().lower()

            cantidad_productos = sum(
                1
                for producto in productos
                if (
                    producto.get("categoria") or ""
                ).strip().lower() == nombre_categoria
            )

            categoria["cantidad_productos"] = cantidad_productos

        return jsonify({
            "mensaje": "Categorías obtenidas correctamente",
            "categorias": categorias
        }), 200

    except Exception as error:
        print(error)

        return jsonify({
            "mensaje": "No se pudieron obtener las categorías"
        }), 500


@categorias_bp.route("/", methods=["POST"])
def crear_categoria():
    datos = request.get_json(silent=True)

    if not datos:
        return jsonify({
            "mensaje": "Debes enviar los datos en formato JSON"
        }), 400

    nombre = datos.get("nombre", "").strip()
    descripcion = datos.get("descripcion", "").strip()

    if not nombre:
        return jsonify({
            "mensaje": "El nombre de la categoría es obligatorio"
        }), 400

    try:
        categoria_existente = (
            supabase_admin
            .table("categorias")
            .select("id")
            .ilike("nombre", nombre)
            .execute()
        )

        if categoria_existente.data:
            return jsonify({
                "mensaje": "Ya existe una categoría con ese nombre"
            }), 409

        respuesta = (
            supabase_admin
            .table("categorias")
            .insert({
                "nombre": nombre,
                "descripcion": descripcion or None
            })
            .execute()
        )

        categoria_creada = respuesta.data[0]
        categoria_creada["cantidad_productos"] = 0

        return jsonify({
            "mensaje": "Categoría creada correctamente",
            "categoria": categoria_creada
        }), 201

    except Exception as error:
        print(error)

        return jsonify({
            "mensaje": "No se pudo crear la categoría"
        }), 500


@categorias_bp.route("/<string:categoria_id>", methods=["PUT"])
def editar_categoria(categoria_id):
    datos = request.get_json(silent=True)

    if not datos:
        return jsonify({
            "mensaje": "Debes enviar los datos en formato JSON"
        }), 400

    nombre = datos.get("nombre", "").strip()
    descripcion = datos.get("descripcion", "").strip()

    if not nombre:
        return jsonify({
            "mensaje": "El nombre de la categoría es obligatorio"
        }), 400

    try:
        respuesta_categoria_anterior = (
            supabase_admin
            .table("categorias")
            .select("*")
            .eq("id", categoria_id)
            .execute()
        )

        if not respuesta_categoria_anterior.data:
            return jsonify({
                "mensaje": "Categoría no encontrada"
            }), 404

        categoria_anterior = respuesta_categoria_anterior.data[0]
        nombre_anterior = (
            categoria_anterior.get("nombre") or ""
        ).strip()

        categoria_existente = (
            supabase_admin
            .table("categorias")
            .select("id")
            .ilike("nombre", nombre)
            .neq("id", categoria_id)
            .execute()
        )

        if categoria_existente.data:
            return jsonify({
                "mensaje": "Ya existe otra categoría con ese nombre"
            }), 409

        respuesta = (
            supabase_admin
            .table("categorias")
            .update({
                "nombre": nombre,
                "descripcion": descripcion or None
            })
            .eq("id", categoria_id)
            .execute()
        )

        if not respuesta.data:
            return jsonify({
                "mensaje": "Categoría no encontrada"
            }), 404

        if nombre_anterior.lower() != nombre.lower():
            respuesta_productos = (
                supabase_admin
                .table("productos")
                .select("id,categoria")
                .execute()
            )

            productos = respuesta_productos.data or []

            for producto in productos:
                categoria_producto = (
                    producto.get("categoria") or ""
                ).strip()

                if categoria_producto.lower() == nombre_anterior.lower():
                    (
                        supabase_admin
                        .table("productos")
                        .update({
                            "categoria": nombre
                        })
                        .eq("id", producto["id"])
                        .execute()
                    )

        categoria_actualizada = respuesta.data[0]

        respuesta_productos_actualizados = (
            supabase_admin
            .table("productos")
            .select("categoria")
            .execute()
        )

        productos_actualizados = (
            respuesta_productos_actualizados.data or []
        )

        cantidad_productos = sum(
            1
            for producto in productos_actualizados
            if (
                producto.get("categoria") or ""
            ).strip().lower() == nombre.lower()
        )

        categoria_actualizada["cantidad_productos"] = cantidad_productos

        return jsonify({
            "mensaje": "Categoría actualizada correctamente",
            "categoria": categoria_actualizada
        }), 200

    except Exception as error:
        print(error)

        return jsonify({
            "mensaje": "No se pudo actualizar la categoría"
        }), 500


@categorias_bp.route("/<string:categoria_id>", methods=["DELETE"])
def eliminar_categoria(categoria_id):
    try:
        respuesta_categoria = (
            supabase_admin
            .table("categorias")
            .select("*")
            .eq("id", categoria_id)
            .execute()
        )

        if not respuesta_categoria.data:
            return jsonify({
                "mensaje": "Categoría no encontrada"
            }), 404

        categoria = respuesta_categoria.data[0]

        nombre_categoria = (
            categoria.get("nombre") or ""
        ).strip().lower()

        respuesta_productos = (
            supabase_admin
            .table("productos")
            .select("id,categoria")
            .execute()
        )

        productos = respuesta_productos.data or []

        categoria_en_uso = any(
            (
                producto.get("categoria") or ""
            ).strip().lower() == nombre_categoria
            for producto in productos
        )

        if categoria_en_uso:
            return jsonify({
                "mensaje": (
                    "No se puede eliminar esta categoría "
                    "porque tiene productos asociados."
                )
            }), 409

        respuesta_eliminacion = (
            supabase_admin
            .table("categorias")
            .delete()
            .eq("id", categoria_id)
            .execute()
        )

        if not respuesta_eliminacion.data:
            return jsonify({
                "mensaje": "Categoría no encontrada"
            }), 404

        return jsonify({
            "mensaje": "Categoría eliminada correctamente"
        }), 200

    except Exception as error:
        print(error)

        return jsonify({
            "mensaje": "No se pudo eliminar la categoría"
        }), 500