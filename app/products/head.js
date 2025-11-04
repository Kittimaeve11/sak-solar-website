// app/products/head.js
import { productsMetadata } from '@/app/seo/productsMetadata';

export default function Head() {
  return (
    <>
      {/* ✅ Title & Basic SEO */}
      <title>{productsMetadata.title}</title>
      <meta name="description" content={productsMetadata.description} />
      <meta name="keywords" content={productsMetadata.keywords} />
      <meta name="author" content={productsMetadata.author} />
      <link rel="canonical" href={productsMetadata.canonical} />

      {/* ✅ Open Graph */}
      <meta property="og:title" content={productsMetadata.og.title} />
      <meta property="og:description" content={productsMetadata.og.description} />
      <meta property="og:image" content={productsMetadata.og.image} />
      <meta property="og:url" content={productsMetadata.og.url} />
      <meta property="og:type" content={productsMetadata.og.type} />

      {/* ✅ Twitter */}
      <meta name="twitter:card" content={productsMetadata.twitter.card} />
      <meta name="twitter:title" content={productsMetadata.twitter.title} />
      <meta name="twitter:description" content={productsMetadata.twitter.description} />
      <meta name="twitter:image" content={productsMetadata.twitter.image} />
    </>
  );
}
