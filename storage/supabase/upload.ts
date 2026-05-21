import { supabase } from "."


export async function uploadImage(uri: string, userId: string) {
  const fileExt = uri.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const response = await fetch(uri)
  const blob = await response.blob()

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, blob, {
      contentType: blob.type,
      upsert: true,
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return data.publicUrl
}
