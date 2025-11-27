// app/faq/page.js

import { Suspense } from 'react';
import FAQPageClient from './FAQPageClient';

export default function Page() {
  return (
 <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>     
  <FAQPageClient />
    </Suspense>
  );
}
