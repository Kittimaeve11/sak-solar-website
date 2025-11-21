import { NextResponse } from 'next/server';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

/* -------------------------------------------------
 🟢 slugify ใช้สร้าง slug ของ Category เท่านั้น
--------------------------------------------------*/
const slugifyCategory = (str) =>
  str?.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

/* -------------------------------------------------
 🟠 Normalize Brand → คืน slug ของ brand เสมอ
--------------------------------------------------*/
const normalizeBrandSlug = (name) => {
  if (!name) return '';
  const cleaned = name.toLowerCase().trim();

  const mapping = {
    huawel: 'huawei',
    huwei: 'huawei',
    huwail: 'huawei',
    huawei: 'huawei',

    growat: 'growatt',
    growwat: 'growatt',
    growatt: 'growatt',

    deye: 'deye',
    daye: 'deye',

    sinclare: 'sinclair',
    sinclair: 'sinclair',
  };

  return mapping[cleaned] || cleaned.replace(/\s+/g, '-');
};

/* -------------------------------------------------
 🧠 Cache โครงสร้าง Category + Brand (15 นาที)
--------------------------------------------------*/
let headerCache = {
  categoryMap: null,
  brandMap: null,
  timestamp: 0,
};

async function loadHeaderMap() {
  const now = Date.now();

  if (headerCache.timestamp && now - headerCache.timestamp < 15 * 60 * 1000) {
    return headerCache;
  }

  try {
    const res = await fetch(`${baseUrl}/api/productHeaderapi`, {
      headers: { 'X-API-KEY': apiKey },
      cache: 'force-cache',
    });

    const data = await res.json();
    if (!data?.status || !Array.isArray(data.result)) return null;

    const categoryMap = {};
    const brandMap = {};

    data.result.forEach((item) => {
      const typeID = item.producttypeID;
      const typeSlug = slugifyCategory(item.producttypenameEN);

      // 🟢 Map slug → typeID
      categoryMap[typeSlug] = typeID;

      (item.Brand || []).forEach((b) => {
        const brandID = b.productbrandID;
        const brandSlug = normalizeBrandSlug(b.productbrandname);

        // 🟠 Map slug → brandID
        brandMap[brandSlug] = brandID;
      });
    });

    headerCache = {
      categoryMap,
      brandMap,
      timestamp: now,
    };

    return headerCache;
  } catch (err) {
    console.error('⚠️ Failed to load HeaderAPI:', err);
    return null;
  }
}

/* -------------------------------------------------
 🛠️ Middleware ทำ URL Rewrite :
 จาก /products/solar-rooftop/huawei/P1234
 เป็น   /products/1/2/P1234   (ID จริง)
--------------------------------------------------*/
export async function middleware(req) {
  const url = req.nextUrl;

  const match = url.pathname.match(/^\/products\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
  if (!match) return NextResponse.next();

  const [, categorySlug, brandSlug, productID] = match;

  const headerMap = await loadHeaderMap();
  if (!headerMap) return NextResponse.next();

  const { categoryMap, brandMap } = headerMap;

  const realTypeID = categoryMap[categorySlug];
  const realBrandID = brandMap[brandSlug];

  if (!realTypeID || !realBrandID) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(
    new URL(`/products/${realTypeID}/${realBrandID}/${productID}`, req.url)
  );
}

/* -------------------------------------------------
 🔍 ใช้ Middleware เฉพาะ path /products/*
--------------------------------------------------*/
export const config = {
  matcher: ['/products/:path*'],
};
