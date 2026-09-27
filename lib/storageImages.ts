import { supabase } from "@/lib/supabaseClient";
import { IMAGE_BUCKET, isImageName } from "@/lib/mediaPaths";
export type StorageImage = {
  name: string;
  path: string;
  url: string;
  createdAt: string;
  size: number;
};
export async function listImages(folder: string): Promise<StorageImage[]> {
  const files: StorageImage[] = [];
  // Offset pagination prevents silently hiding images beyond Storage's default limit.
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .list(folder, {
        limit: 100,
        offset,
        sortBy: { column: "name", order: "asc" },
      });
    if (error) throw error;
    for (const file of data ?? []) {
      if (!file.id || !isImageName(file.name)) continue;
      const path = `${folder}/${file.name}`;
      files.push({
        name: file.name,
        path,
        url: supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data
          .publicUrl,
        createdAt: file.created_at ?? "",
        size: Number(file.metadata?.size ?? 0),
      });
    }
    if (!data || data.length < 100) break;
  }
  if (folder === "avatar")
    files.sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt) || b.name.localeCompare(a.name),
    );
  return files;
}
