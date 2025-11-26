//  ห้ามใส่ 'use client' ในไฟล์นี้

import { Suspense } from 'react';
import HomeClient from './HomeClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <HomeClient />
    </Suspense>
  );
}
