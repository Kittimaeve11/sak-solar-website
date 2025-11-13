import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// แปลงชื่อให้เป็น slug
const slugify = (str) =>
  str
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    || "";

// normalize huawel → huawei
const normalizeBrandName = (name) => {
  if (!name) return "";
  const cleaned = name.trim().toLowerCase();
  const mapping = {
    huawel: "huawei",
    huawei: "huawei",
    growatt: "growatt",
    deye: "deye",
    sinclair: "sinclair"
  };
  return mapping[cleaned] || cleaned;
};

// โหลด header API เพื่อดึง mapping จริง
async function loadHeaderMap() {
  try {
    const res = await fetch(`${baseUrl}/api/productHeaderapi`, {
      headers: { "X-API-KEY": apiKey }
    });

    const data = await res.json();

    if (!data?.status || !Array.isArray(data.result)) return null;

    const typeMap = {};
    const brandMap = {};

    data.result.forEach((typeItem) => {
      const typeID = typeItem.producttypeID;
      const typeSlug = slugify(typeItem.producttypenameEN);

      typeMap[typeSlug] = typeID;

      typeItem.Brand.forEach((b) => {
        const brandID = b.productbrandID;
        const brandSlug = slugify(normalizeBrandName(b.productbrandname));

        brandMap[brandSlug] = brandID;
      });
    });

    return { typeMap, brandMap };
  } catch (err) {
    console.error("HeaderAPI load failed:", err);
    return null;
  }
}

export async function middleware(req) {
  const url = req.nextUrl;

  // match: /products/slug-type/slug-brand/productID
  const match = url.pathname.match(/^\/products\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);

  if (!match) return NextResponse.next();

  const [, typeSlug, brandSlug, productID] = match;

  const headerMap = await loadHeaderMap();

  if (!headerMap) return NextResponse.next();

  const { typeMap, brandMap } = headerMap;

  const realTypeID = typeMap[typeSlug];
  const realBrandID = brandMap[brandSlug];

  // ถ้า slug ไม่มีใน mapping → ไม่ rewrite
  if (!realTypeID || !realBrandID) return NextResponse.next();

  // Rewrite ไป route จริง
  return NextResponse.rewrite(
    new URL(`/products/${realTypeID}/${realBrandID}/${productID}`, req.url)
  );
}

export const config = {
  matcher: ['/products/:path*'],
};
