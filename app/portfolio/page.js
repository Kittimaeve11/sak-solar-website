// app/portfolio/page.js
import { Suspense } from 'react';
import PortfolioClient from './PortfolioClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PortfolioClient />
    </Suspense>
  );
}
