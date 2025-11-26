import { Suspense } from 'react';
import AboutPageClient from './AboutPageClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <AboutPageClient />
    </Suspense>
  );
}
