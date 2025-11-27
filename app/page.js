//  ห้ามใส่ 'use client' ในไฟล์นี้

import { Suspense } from 'react';
import HomeClient from './HomeClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>      
    <HomeClient />
    </Suspense>
  );
}
