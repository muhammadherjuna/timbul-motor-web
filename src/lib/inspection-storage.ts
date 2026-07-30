import { supabase } from "./supabase";

export async function uploadInspectionEvidence(file: File, sessionId: string, itemId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `inspection-evidence/${sessionId}/${itemId}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("motors")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase storage error:", error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("motors")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Error uploading inspection evidence:", err);
    return null;
  }
}
