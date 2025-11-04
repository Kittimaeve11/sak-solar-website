'use client';

import React, { use } from 'react';
import ProductsPage from '../page'; // ดึงจาก products/page.js

export default function TypePage({ params }) {
  const resolvedParams = use(params); //  ต้อง unwrap
  const { typeID } = resolvedParams;

  return <ProductsPage typeId={Number(typeID)} />;
}
