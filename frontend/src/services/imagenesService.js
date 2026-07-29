import { supabase } from "../config/supabase";

export async function subirImagenProducto(archivo) {
  if (!archivo) {
    return null;
  }

  const extension = archivo.name.split(".").pop();
  const nombreUnico = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const rutaArchivo = `productos/${nombreUnico}`;

  const { error } = await supabase.storage
    .from("productos")
    .upload(rutaArchivo, archivo, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  const { data } = supabase.storage
    .from("productos")
    .getPublicUrl(rutaArchivo);

  return data.publicUrl;
}