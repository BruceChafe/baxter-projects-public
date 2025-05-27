import { supabase } from "../../../../../supabase/supabaseClient";

export const uploadLicenseImage = async (
  file: File,
  contactId: string,
  side: 'front' | 'rear'
): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `contact-${contactId}/${side}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('license-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError.message);
    return null;
  }

  const { data, error: urlError } = await supabase.storage
    .from('license-images')
    .createSignedUrl(filePath, 60 * 60); // 1 hour

  if (urlError) {
    console.error('Signed URL error:', urlError.message);
    return null;
  }

  return data?.signedUrl || null;
};
