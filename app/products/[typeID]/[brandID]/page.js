'use client';

import React, { use } from 'react';
import ProductsPage from '../../page'; 
// ดึงหน้า Products หลักจาก /products/page.js

export default function BrandPage({ params }) {
  // Next.js 15 ส่ง params แบบ async ต้องใช้ use() เพื่อ unwrap
  const resolvedParams = use(params);

  // รับ slug แทนตัวเลข (dynamic route: /products/[categorySlug]/[brandSlug])
  const { categorySlug, brandSlug } = resolvedParams;

  // ส่งค่า slug เข้าไปให้ ProductsPage เพื่อใช้ filter
  return <ProductsPage categorySlug={categorySlug} brandSlug={brandSlug} />;
}
