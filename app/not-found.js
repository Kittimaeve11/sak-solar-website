'use client';

import { Suspense } from 'react';
import NotFoundContent from './NotFoundContent';

export default function NotFound() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
