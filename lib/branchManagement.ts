export const languages = [
  { code: "fa", label: "فارسی" },
  { code: "ar", label: "عربی" },
  { code: "en", label: "انگلیسی" },
] as const;
type Language = (typeof languages)[number]["code"];
type BranchText =
  | "slug"
  | "phone_1"
  | "phone_2"
  | "latitude"
  | "longitude"
  | "open"
  | "close"
  | `${"name" | "address"}_${Language}`;
type PublicText =
  | "manager_number"
  | `${"manager_name" | "manager_description" | "manager_office" | "about"}_${Language}`;
export type BranchDraft = Record<BranchText, string> & {
  is_active: boolean;
  is_open: boolean;
};
export type PublicDraft = Record<PublicText, string>;
export type BranchRecord = Omit<BranchDraft, "latitude" | "longitude"> & {
  id: string;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
};
export type PublicRecord = PublicDraft & { id: string; created_at: string };
export const emptyBranch: BranchDraft = {
  slug: "",
  name_fa: "",
  name_ar: "",
  name_en: "",
  address_fa: "",
  address_ar: "",
  address_en: "",
  phone_1: "",
  phone_2: "",
  latitude: "",
  longitude: "",
  open: "",
  close: "",
  is_active: true,
  is_open: true,
};
export const emptyPublic: PublicDraft = {
  manager_number: "",
  manager_name_fa: "",
  manager_name_ar: "",
  manager_name_en: "",
  manager_description_fa: "",
  manager_description_ar: "",
  manager_description_en: "",
  manager_office_fa: "",
  manager_office_ar: "",
  manager_office_en: "",
  about_fa: "",
  about_ar: "",
  about_en: "",
};
export function toDraft<T extends object>(template: T, row: object): T {
  const values = row as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(template).map(([key, fallback]) => [
      key,
      typeof fallback === "boolean"
        ? (values[key] ?? fallback)
        : String(values[key] ?? ""),
    ]),
  ) as T;
}
export function nullableText<T extends object>(draft: T) {
  return Object.fromEntries(
    Object.entries(draft).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() || null : value,
    ]),
  );
}
export function validateBranch(draft: BranchDraft): string | null {
  if (!draft.name_fa.trim()) return "نام فارسی شعبه را وارد کنید.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug.trim()))
    return "شناسه باید شامل حروف کوچک انگلیسی، عدد و خط تیره باشد.";
  for (const [key, limit, label] of [
    ["latitude", 90, "عرض"],
    ["longitude", 180, "طول"],
  ] as const) {
    const value = draft[key].trim();
    if (
      value &&
      (!Number.isFinite(Number(value)) || Math.abs(Number(value)) > limit)
    )
      return `${label} جغرافیایی باید عددی بین ${-limit} و ${limit} باشد.`;
  }
  if (!!draft.latitude.trim() !== !!draft.longitude.trim())
    return "طول و عرض جغرافیایی را با هم وارد کنید یا هر دو را خالی بگذارید.";
  // Keep legacy hour-only values intact; never infer AM/PM.
  for (const key of ["open", "close"] as const) {
    if (
      draft[key].trim() &&
      !/^(?:[01]?\d|2[0-3])(?::[0-5]\d(?::[0-5]\d)?)?$/.test(draft[key].trim())
    )
      return "ساعت باید بین ۰ تا ۲۳ یا به شکل 23:30 با ارقام انگلیسی باشد.";
  }
  return null;
}
export function databaseError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === "23505")
    return "این شناسه قبلاً ثبت شده است؛ شناسه دیگری انتخاب کنید.";
  if (code === "42501" || code === "PGRST301")
    return "اجازه دسترسی ندارید. نشست ورود و سیاست‌های RLS سوپابیس را بررسی کنید.";
  return "عملیات انجام نشد. اتصال و دسترسی سوپابیس را بررسی و دوباره تلاش کنید.";
}
