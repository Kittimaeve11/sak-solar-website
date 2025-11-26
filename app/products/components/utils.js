export const slugify = (name) =>
  name?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

export const normalizeBrandName = (name) => {
  if (!name) return "";
  const cleaned = name.trim().toLowerCase();

  const mapping = {
    huawel: "Huawei",
    huawei: "Huawei",
    deye: "Deye",
    growatt: "Growatt",
    sinclair: "Sinclair",
  };
  return mapping[cleaned] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export const getImageUrl = (path) => {
  if (!path || typeof path !== "string") return "/images/no-image.jpg";
  if (path.startsWith("http")) return path;

  try {
    return new URL(path, process.env.NEXT_PUBLIC_BASE_URL_API ?? window.location.origin).toString();
  } catch {
    return "/images/no-image.jpg";
  }
};
