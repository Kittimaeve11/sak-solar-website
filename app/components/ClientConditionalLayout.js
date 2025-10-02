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
import { motion, AnimatePresence } from 'framer-motion';

export default function ClientConditionalLayout({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname === '/not-found';

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <>
      <GoogleAnalytics GA_MEASUREMENT_ID="G-GRQS76P3XV" />

      {!hideLayout && (
        <>
          <Navbar />
          <TabMenu /> 
        </>
      )}

      {/* ใช้ AnimatePresence + motion.main */}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

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
