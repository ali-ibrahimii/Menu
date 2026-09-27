export const IMAGE_BUCKET = "images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const imageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
export const isImageName = (name: string) => /\.(jpe?g|png|webp)$/i.test(name);
const folders: Record<string, string> = {
  main: "first-branch",
  "main-branch": "first-branch",
  "first-branch": "first-branch",
  branch2: "second-branch",
  "second-branch": "second-branch",
  shop: "shop",
  "vatandar-shop": "shop",
};
export function getFolderForBranch(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  // New branches must not silently share the first branch's images.
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized))
    throw new Error("شناسه شعبه برای پوشه تصاویر معتبر نیست.");
  return folders[normalized] ?? `branches/${normalized}`;
}
export function validateImage(file: {
  type: string;
  size: number;
}): string | null {
  if (!imageExtensions[file.type])
    return "فقط تصاویر JPG، PNG و WebP مجاز هستند.";
  if (!file.size || file.size > MAX_IMAGE_BYTES)
    return "حجم تصویر باید بیشتر از صفر و حداکثر ۵ مگابایت باشد.";
  return null;
}
