//  app/editorialsolar/page.js
import EditorialClient from './EditorialClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API || '';
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API || '';

async function safeJsonFetch(url, options = {}) {
  try {
    const API_ENABLED = false;

    if (!API_ENABLED) {
      setLoading(false);
      return;
    }
    const res = await fetch(url, {
      headers: { 'X-API-KEY': apiKey, ...(options.headers || {}) },
      cache: 'no-store',
    });

    if (!res.ok) {
      // console.error('[Editorial] Fetch failed:', url, 'status:', res.status);
      return null;
    }

    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

export default async function EditorialPage() {
  // console.log("ENV:", {
  //   nodeEnv: process.env.NODE_ENV,
  //   baseUrl,
  //   apiKeyExists: !!apiKey,
  // });

  const [typesRes, articlesRes, bannersRes] = await Promise.all([
    safeJsonFetch(`${baseUrl.replace(/\/$/, '')}/api/edittorTypepageapi`),
    safeJsonFetch(`${baseUrl.replace(/\/$/, '')}/api/edittorpageapi?limit=1000`),
    safeJsonFetch(`${baseUrl.replace(/\/$/, '')}/api/branderIDapi/15`),
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
