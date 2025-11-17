'use client'; 

import React, { use } from 'react';
import ProductsPage from '../../page';  
// ดึง component หลักของหน้า Products จากโฟลเดอร์ products/page.js 
// เพื่อนำมาใช้เพื่อแสดงผลสินค้าตาม type + brand ที่ส่งเข้าไป

export default function BrandPage({ params }) {
  // Next.js ส่ง params มาเป็น Async Context 
  // จำเป็นต้องใช้ use() เพื่อ unwrap ค่า
  const resolvedParams = use(params);  

  // ดึงค่าพารามิเตอร์จาก dynamic route  /products/[typeID]/[brandID]
  const { typeID, brandID } = resolvedParams;

  // ส่งพารามิเตอร์เข้าไปให้ ProductsPage 
  // แปลงเป็น Number เพื่อความถูกต้องของ logic ภายในหน้า Products
  return <ProductsPage typeId={Number(typeID)} brandId={Number(brandID)} />;
}
