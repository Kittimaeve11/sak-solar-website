'use client';

import React, { use } from 'react';
import ProductsPage from '../../page'; // ดึงจาก products/[typeID]/page.js

export default function BrandPage({ params }) {
  const resolvedParams = use(params); //  ต้อง unwrap
  const { typeID, brandID } = resolvedParams;

  return <ProductsPage typeId={Number(typeID)} brandId={Number(brandID)} />;
}
