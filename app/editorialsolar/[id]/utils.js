const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;

export function parseHTML(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/^"+|"+$/g, "")
    .trim();
}

export function getImageUrls(galleryStr) {
  if (!galleryStr) return [];

  const cleanPath = (path) => {
    let fixed = String(path).replace(/^"+|"+$/g, "").trim();

    // 🔥 เติม Gallery/ ถ้าไม่เจอ
    if (!fixed.startsWith("Gallery/")) {
      fixed = `Gallery/${fixed}`;
    }

    fixed = fixed
      .replace(/\\/g, "/")            // แก้ backslash
      .replace(/\/{2,}/g, "/")        // ลบ // ซ้ำ
      .replace(/\.jpe$/i, ".jpeg")    // แก้ .jpe → .jpeg
      .replace(/^\//, "");            // ลบ / หน้าแรกถ้ามี

    return `${baseUrl}/${fixed}`;
  };

  try {
    const arr = JSON.parse(galleryStr);
    if (Array.isArray(arr)) {
      return arr
        .flatMap((item) => String(item).split(",")) // เผื่อกรณีรวมใน array เดียว
        .map((item) => cleanPath(item));
    }
    return [cleanPath(arr)];
  } catch {
    return galleryStr
      .split(",")
      .map((item) => cleanPath(item));
  }
}
