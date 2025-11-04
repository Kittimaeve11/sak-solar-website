'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Navbar from './Navbar';
import TabMenu from './TabMenu';
import Footer from './Footer';
import BackToTopButton from './BackToTopButton';
import FloatingButtons from './FloatingButtons';
import ToastProvider from './ToastProvider';
import CookieBanner from './CookieBanner';
import GoogleAnalytics from './GoogleAnalytics';
import { motion } from 'framer-motion';

/**
 * ✅ Layout ฝั่ง Client:
 * - มี fade-in transition
 * - ไม่ reload API ซ้ำ
 * - เก็บ state ไว้ใน memory
 */
export default function ClientConditionalLayout({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname === '/not-found';

  const [mounted, setMounted] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);

  // ✅ แสดงหลัง hydration เท่านั้น
  useEffect(() => setMounted(true), []);

  // ✅ เปลี่ยน fadeKey เฉพาะตอนเปลี่ยนหน้า
  const prevPath = useRef(pathname);
  useEffect(() => {
    if (mounted && prevPath.current !== pathname) {
      setFadeKey((k) => k + 1);
      prevPath.current = pathname;
    }
  }, [pathname, mounted]);

  // ✅ ป้องกันโหลด API ซ้ำ
  useEffect(() => {
    if (!window.__LOADED_ONCE__) {
      window.__LOADED_ONCE__ = true;
      console.log('🌞 Loaded main layout (ครั้งแรกเท่านั้น)');
    } else {
      console.log('♻️ Layout ถูก reuse (ไม่ reload API)');
    }
  }, []);

  if (!mounted) {
    return <div style={{ opacity: 0, transition: 'opacity 0.2s ease-in' }}>{children}</div>;
  }

  return (
    <>
      <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />

      {!hideLayout && (
        <>
          <Navbar />
          <TabMenu />
        </>
      )}

      {/* เฟดอินตอนเปลี่ยนหน้า */}
      <motion.main
        key={fadeKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ minHeight: '100vh' }}
      >
        {children}
      </motion.main>

      {!hideLayout && (
        <>
          <ToastProvider />
          <FloatingButtons />
          <BackToTopButton />
          <CookieBanner />
          <Footer />
        </>
      )}
    </>
  );
}
