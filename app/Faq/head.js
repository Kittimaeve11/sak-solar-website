import { faqMetadata } from '@/app/seo/faqMetadata';

export default function Head() {
  return (
    <>
      <title>{faqMetadata.title}</title>
      <meta name="description" content={faqMetadata.description} />
      <meta name="keywords" content={faqMetadata.keywords} />
      <meta name="author" content={faqMetadata.author} />
      <link rel="canonical" href={faqMetadata.canonical} />

      {/* ✅ Open Graph */}
      <meta property="og:title" content={faqMetadata.og.title} />
      <meta property="og:description" content={faqMetadata.og.description} />
      <meta property="og:image" content={faqMetadata.og.image} />
      <meta property="og:url" content={faqMetadata.og.url} />
      <meta property="og:type" content={faqMetadata.og.type} />

      {/* ✅ Twitter */}
      <meta name="twitter:card" content={faqMetadata.twitter.card} />
      <meta name="twitter:title" content={faqMetadata.twitter.title} />
      <meta name="twitter:description" content={faqMetadata.twitter.description} />
      <meta name="twitter:image" content={faqMetadata.twitter.image} />
    </>
  );
}
