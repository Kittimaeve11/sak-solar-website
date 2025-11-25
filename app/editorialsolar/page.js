import EditorialClient from "./EditorialClient";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_API;
const apiKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY_API;

export default async function EditorialPage() {
  const [resType, resArticle, resBanner] = await Promise.all([
    fetch(`${baseUrl}/api/edittorTypepageapi`, {
      headers: { 'X-API-KEY': apiKey },
      next: { revalidate: 3600 },
    }),
    fetch(`${baseUrl}/api/edittorpageapi?limit=1000`, {
      headers: { 'X-API-KEY': apiKey },
      next: { revalidate: 3600 },
    }),
    fetch(`${baseUrl}/api/branderIDapi/15`, {
      headers: { 'X-API-KEY': apiKey },
      next: { revalidate: 3600 },
    }),
  ]);

  const types = await resType.json();
  const articles = await resArticle.json();
  const bannersData = await resBanner.json();

  const banners = Array.isArray(bannersData?.data)
    ? bannersData.data
    : [bannersData.data];

  return (
    <EditorialClient
      articles={articles?.result?.data || []}
      types={types?.result || []}
      banners={banners}
    />
  );
}
