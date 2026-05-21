import * as FileSystem from "expo-file-system/legacy"
import { supabase } from "."
import { decode } from 'base64-arraybuffer';

export async function uploadMedia(uri: string, userId: string) {
  const ext = uri.split(".").pop()?.toLowerCase() || "jpg"
  const isVideo = ["mp4", "mov"].includes(ext)

  const fileName = `${userId}-${Date.now()}.${ext}`
  const filePath = `medias/${fileName}`

  // 1. Read file as base64 string
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  })

  // 2. Decode directly into an ArrayBuffer (No Blob or atob needed)
  const arrayBuffer = decode(base64)

  if (arrayBuffer.byteLength === 0) {
    throw new Error("ArrayBuffer is empty — file could not be read.")
  }

  // 3. Upload the ArrayBuffer directly to Supabase
  const { data: uploadData, error } = await supabase.storage
    .from("tokrah")
    .upload(filePath, arrayBuffer, {
      contentType: isVideo ? `video/${ext}` : `image/${ext}`,
      upsert: true,
    })

  if (error) throw error

  const { data: publicData } = supabase.storage
    .from("tokrah")
    .getPublicUrl(filePath)

  return {
    id: uploadData?.path ?? fileName,
    url: publicData.publicUrl,
    type: isVideo ? "VIDEO" : "IMAGE",
  }
}
