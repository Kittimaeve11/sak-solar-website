import { Suspense } from 'react';
import ReviewClient from './ReviewClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <ReviewClient />
    </Suspense>
  );
}
