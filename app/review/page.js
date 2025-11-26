import { Suspense } from 'react';
import ReviewClient from './ReviewClient';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ReviewClient />
    </Suspense>
  );
}
