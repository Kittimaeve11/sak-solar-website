// 📄 app/editorialsolar/page.js
import EditorialClient from './EditorialClient';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

// ✅ กรณีพิเศษ: อยู่บน production แต่ BASE_URL ยังเป็น localhost
//    แปลว่าบน Netlify จะเรียก API ไม่ได้แน่นอน
const isProdWithLocalApi =
  process.env.NODE_ENV === 'production' &&
  baseUrl &&
  baseUrl.includes('localhost');

// จะบังคับให้เป็น dynamic page ก็ได้ (ไม่ต้อง prerender เป็น static)
// export const dynamic = 'force-dynamic';
// หรือจะใช้ revalidate แทนก็ได้
// export const revalidate = 0;

/* =========================================================
   helper: ดึง JSON แบบปลอดภัย ไม่ทำให้ build แตก
========================================================= */
async function safeJsonFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      headers: { 'X-API-KEY': apiKey, ...(options.headers || {}) },
      next: options.next || { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error('[Editorial] Fetch failed:', url, 'status:', res.status);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('[Editorial] Error fetching:', url, err);
    return null; // ❗ สำคัญ: อย่า throw ต่อ
  }
}

/* =========================================================
   Page Component
========================================================= */
export default async function EditorialPage() {
  // 🛡️ เคสนี้คือ: Build/Run อยู่บน production + ใช้ localhost เป็น API
  // 👉 Netlify ต่อไม่ถึงแน่นอน เลยส่งข้อมูลว่าง ๆ ไปก่อน เพื่อให้ build ผ่าน
  if (isProdWithLocalApi) {
    return (
      <EditorialClient
        articles={[]}
        types={[]}
        banners={[]}
      />
    );
  }

  // 🟢 กรณีปกติ (เช่น dev บนเครื่อง หรือ production ที่ใช้ API จริง)
  const [typesRes, articlesRes, bannersRes] = await Promise.all([
    safeJsonFetch(`${baseUrl}/api/edittorTypepageapi`),
    safeJsonFetch(`${baseUrl}/api/edittorpageapi?limit=1000`),
    safeJsonFetch(`${baseUrl}/api/branderIDapi/15`),
  ]);

  const types = typesRes?.result || [];
  const articles = articlesRes?.result?.data || [];

  const bannersData = bannersRes;
  const banners = Array.isArray(bannersData?.data)
    ? bannersData.data
    : bannersData?.data
    ? [bannersData.data]
    : [];

  return (
    <EditorialClient
      articles={articles}
      types={types}
      banners={banners}
    />
  );
}
