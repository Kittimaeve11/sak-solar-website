import { Suspense } from 'react';
import AboutPageClient from './AboutPageClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>    
     <AboutPageClient />
    </Suspense>
  );
}
