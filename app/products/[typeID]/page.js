'use client';

import React, { use } from 'react';
import ProductsPage from '../page'; // ดึงจาก products/page.js

export default function TypePage({ params }) {
  // ต้อง unwrap params
  const { typeID } = use(params);

  return <ProductsPage typeId={Number(typeID)} />;
}
