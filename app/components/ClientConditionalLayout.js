'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import TabMenu from './TabMenu';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import FloatingButtons from './FloatingButtons';
import ToastProvider from './ToastProvider';
import CookieBanner from './CookieBanner';
import GoogleAnalytics from './GoogleAnalytics';
import { motion } from 'framer-motion';

/* ====== Component หลัก ClientConditionalLayout ====== */
export default function ClientConditionalLayout({ children }) {
  const pathname = usePathname(); // ดึง path ปัจจุบันจาก Next.js router
  const hideLayout = pathname === '/not-found'; // ซ่อน layout ถ้าเป็นหน้าที่ไม่พบข้อมูล

  const [mounted, setMounted] = useState(false); // state สำหรับเช็คว่า client render แล้ว
  useEffect(() => setMounted(true), []); // ให้ mounted เป็น true หลังจาก client mount ครั้งแรก

  if (!mounted) return null; // ป้องกัน hydration mismatch ตอน SSR

  return (
    <>
      {/* Google Analytics สำหรับเก็บสถิติการเข้าใช้งาน */}
      <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />

      {/* เงื่อนไข ถ้าไม่ใช่หน้า not-found ให้แสดง Navbar และ TabMenu */}
      {!hideLayout && (
        <>
          <Navbar />
          <TabMenu />
        </>
      )}

      {/* ส่วน main ที่ห่อด้วย motion เพื่อทำ transition เฉพาะ children เวลาเปลี่ยนหน้า */}
      <motion.main
        key={pathname} // ให้ motion detect การเปลี่ยนเส้นทาง
        initial={{ opacity: 0 }} // เริ่มต้นจางหาย
        animate={{ opacity: 1 }} // ทำให้ค่อยๆ แสดงขึ้นมา
        transition={{ duration: 0.25, ease: "easeInOut" }} // ระยะเวลาและรูปแบบ easing
      >
        {children}
      </motion.main>

      {/* เงื่อนไข ถ้าไม่ใช่หน้า not-found ให้แสดง Footer และองค์ประกอบอื่นๆ */}
      {!hideLayout && (
        <>
          <ToastProvider /> {/* สำหรับแสดงแจ้งเตือน */}
          <FloatingButtons /> {/* ปุ่มลอย */}
          <BackToTopButton /> {/* ปุ่มเลื่อนกลับไปด้านบน */}
          <CookieBanner /> {/* แบนเนอร์แจ้ง Cookie */}
          <Footer /> {/* ส่วนท้ายเว็บไซต์ */}
        </>
      )}
    </>
  );
}
