'use client'; // บอก Next.js ว่าไฟล์นี้เป็น Client Component

import React, { createContext, useState, useContext } from 'react';
// นำเข้า React และฟังก์ชันสำหรับสร้างและใช้ Context รวมถึงจัดการสถานะ
import en from '@/locales/en.json';
import th from '@/locales/th.json';

const LocaleContext = createContext(); 
// สร้าง Context สำหรับเก็บข้อมูลภาษาที่เลือกและข้อความแปล

export function LocaleProvider({ children }) {
  // สร้าง Provider เพื่อแชร์ข้อมูลกับ component ลูกที่อยู่ภายใน
  const [locale, setLocale] = useState('th'); 
  // สร้างสถานะ locale เริ่มต้นเป็น 'th' (ภาษาไทย)
  
  const messages = locale === 'en' ? en : th; 
  // เลือกข้อความแปลตามภาษาที่เลือก

  const switchLocale = (newLocale) => {
    setLocale(newLocale); 
    // ฟังก์ชันเปลี่ยนภาษาโดยอัพเดตสถานะ locale
  };

  return (
    <LocaleContext.Provider value={{ locale, messages, switchLocale }}>
      {/* ส่งค่า locale, messages และฟังก์ชัน switchLocale ให้ component ลูก */}
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
  // สร้าง hook ให้ component อื่นเรียกใช้ Context นี้ง่ายขึ้น
}
