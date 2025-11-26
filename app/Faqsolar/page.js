// app/faq/page.js

import { Suspense } from 'react';
import FAQPageClient from './FAQPageClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <FAQPageClient />
    </Suspense>
  );
}
