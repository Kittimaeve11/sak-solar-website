// app/portfolio/page.js
import { Suspense } from 'react';
import PortfolioClient from './PortfolioClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <PortfolioClient />
    </Suspense>
  );
}
