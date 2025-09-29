'use client';

import React, { use } from 'react';
import ProductsPage from '../../page'; // ดึงจาก products/[typeID]/page.js

export default function BrandPage({ params }) {
  // ต้อง unwrap params
  const { typeID, brandID } = use(params);

  return <ProductsPage typeId={Number(typeID)} brandId={Number(brandID)} />;
}
