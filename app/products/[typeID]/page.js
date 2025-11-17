'use client';

import React, { use } from 'react';
import ProductsPage from '../page'; 
// import หน้า Products หลัก (products/page.js)
// เพื่อใช้แสดงรายการสินค้าตาม category/type ที่ส่งมา

export default function TypePage({ params }) {
  // ใน Next.js 15 dynamic route params ถูกส่งมาแบบ async
  // ต้องใช้ use() เพื่อ unwrap ค่าออกมาเป็น object ปกติ
  const resolvedParams = use(params);  

  // ดึงค่า typeID จาก dynamic route: /products/[typeID]
  // เช่น /products/1  →  typeID = "1"
  const { typeID } = resolvedParams;

  // ส่งค่า typeId เข้าไปยัง ProductsPage
  // แปลงเป็น Number เพื่อความถูกต้องของ logic ภายในหน้า Products
  return <ProductsPage typeId={Number(typeID)} />;
}
