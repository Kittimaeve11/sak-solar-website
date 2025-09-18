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

export default function ClientConditionalLayout({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname === '/not-found';

  // 👇 state สำหรับเช็คว่า client mount แล้ว
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // ตอน SSR ยังไม่ render motion.div → ป้องกัน mismatch
    return null;
  }

  return (
    <>
      <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />

      {!hideLayout && (
        <>
          {/* ❌ ไม่มีอนิเมชั่น */}
          <Navbar />
          <TabMenu />
        </>
      )}

      <main>{children}</main>

      {!hideLayout && (
        <>
          {/* ส่วนนี้ยังมีอนิเมชั่น */}
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <ToastProvider />
            <FloatingButtons />
            <BackToTopButton />
            <CookieBanner />
            <Footer />
          </motion.div>
        </>
      )}
    </>
  );
}
