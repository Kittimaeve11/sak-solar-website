// app/head.js
import { homeMetadata } from './seo/homeMetadata';

export default function Head() {
  return (
    <>
      {/* ✅ Title + Basic SEO */}
      <title>{homeMetadata.title}</title>
      <meta name="description" content={homeMetadata.description} />
      <meta name="keywords" content={homeMetadata.keywords} />
      <meta name="author" content={homeMetadata.author} />
      <link rel="canonical" href={homeMetadata.canonical} />

      {/* ✅ OG (Open Graph) */}
      <meta property="og:title" content={homeMetadata.og.title} />
      <meta property="og:description" content={homeMetadata.og.description} />
      <meta property="og:image" content={homeMetadata.og.image} />
      <meta property="og:url" content={homeMetadata.og.url} />
      <meta property="og:type" content={homeMetadata.og.type} />

      {/* ✅ Twitter */}
      <meta name="twitter:card" content={homeMetadata.twitter.card} />
      <meta name="twitter:title" content={homeMetadata.twitter.title} />
      <meta name="twitter:description" content={homeMetadata.twitter.description} />
      <meta name="twitter:image" content={homeMetadata.twitter.image} />
    </>
  );
}
