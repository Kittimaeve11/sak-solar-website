import { Suspense } from 'react';
import AboutPageClient from './AboutPageClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AboutPageClient />
    </Suspense>
  );
}
